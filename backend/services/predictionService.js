const { spawn } = require('child_process');
const path = require('path');
const Expense = require('../models/Expense');

/**
 * Call Python ML service for expense prediction
 */
async function callPythonPredictor(transactions) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../ml/expense_predictor.py');
        
        // Spawn Python process
        const pythonProcess = spawn('python', [pythonScript]);
        
        let outputData = '';
        let errorData = '';
        
        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });
        
        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });
        
        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorData}`));
            } else {
                try {
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (err) {
                    reject(new Error(`Failed to parse Python output: ${err.message}`));
                }
            }
        });
        
        // Send transaction data to Python via stdin
        pythonProcess.stdin.write(JSON.stringify(transactions));
        pythonProcess.stdin.end();
    });
}

/**
 * Generate expense predictions
 */
async function generateExpensePrediction(userId) {
    try {
        // Fetch user's expense history (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const expenses = await Expense.find({
            userId: userId,
            date: { $gte: twelveMonthsAgo }
        }).sort({ date: 1 });
        
        if (expenses.length === 0) {
            return {
                success: false,
                error: 'No expense data found. Add some expenses first.'
            };
        }
        
        // Prepare data for Python
        const transactions = expenses.map(exp => ({
            date: exp.date.toISOString(),
            amount: exp.amount,
            category: exp.category
        }));
        
        // Call Python ML service
        const prediction = await callPythonPredictor(transactions);
        
        if (!prediction.success) {
            return prediction;
        }
        
        // Add category-wise predictions
        const categoryPredictions = await generateCategoryPredictions(userId);
        
        return {
            ...prediction,
            categoryPredictions
        };
        
    } catch (error) {
        console.error('Prediction error:', error);
        
        // Fallback to simple average
        return generateSimplePrediction(userId);
    }
}

/**
 * Generate category-wise predictions
 */
async function generateCategoryPredictions(userId) {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const expenses = await Expense.find({
            userId: userId,
            date: { $gte: threeMonthsAgo }
        });
        
        // Group by category
        const categoryTotals = {};
        expenses.forEach(exp => {
            if (!categoryTotals[exp.category]) {
                categoryTotals[exp.category] = { total: 0, count: 0 };
            }
            categoryTotals[exp.category].total += exp.amount;
            categoryTotals[exp.category].count += 1;
        });
        
        // Calculate averages
        const predictions = Object.entries(categoryTotals).map(([category, data]) => ({
            category,
            predicted_amount: data.total / 3, // Average per month
            confidence: 0.7,
            transactions_count: data.count
        }));
        
        // Sort by predicted amount
        predictions.sort((a, b) => b.predicted_amount - a.predicted_amount);
        
        return predictions.slice(0, 5); // Top 5 categories
        
    } catch (error) {
        console.error('Category prediction error:', error);
        return [];
    }
}

/**
 * Simple fallback prediction (average of last 3 months)
 */
async function generateSimplePrediction(userId) {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const expenses = await Expense.find({
            userId: userId,
            date: { $gte: threeMonthsAgo }
        });
        
        if (expenses.length === 0) {
            return {
                success: false,
                error: 'Insufficient data for prediction'
            };
        }
        
        // Calculate monthly averages
        const monthlyData = {};
        expenses.forEach(exp => {
            const monthKey = exp.date.toISOString().substring(0, 7); // YYYY-MM
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += exp.amount;
        });
        
        const monthlyTotals = Object.values(monthlyData);
        const average = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
        
        // Simple prediction
        return {
            success: true,
            prediction: {
                next_month: average,
                next_3_months: [average, average, average],
                confidence: 0.6,
                method: 'simple_average'
            },
            historical: {
                months: Object.keys(monthlyData),
                values: monthlyTotals
            },
            statistics: {
                average: average,
                min: Math.min(...monthlyTotals),
                max: Math.max(...monthlyTotals)
            },
            trend: {
                trend: 'stable',
                growth_rate: 0,
                volatility: 'medium'
            }
        };
        
    } catch (error) {
        console.error('Simple prediction error:', error);
        return {
            success: false,
            error: 'Unable to generate prediction'
        };
    }
}

/**
 * Get prediction insights
 */
function generatePredictionInsights(predictionData) {
    if (!predictionData.success) {
        return null;
    }
    
    const { prediction, statistics, trend } = predictionData;
    const insights = [];
    
    // Compare prediction with historical average
    const percentageDiff = ((prediction.next_month - statistics.average) / statistics.average) * 100;
    
    if (percentageDiff > 10) {
        insights.push({
            type: 'warning',
            message: `Expected spending is ${percentageDiff.toFixed(1)}% higher than your average. Plan accordingly.`
        });
    } else if (percentageDiff < -10) {
        insights.push({
            type: 'positive',
            message: `Expected spending is ${Math.abs(percentageDiff).toFixed(1)}% lower than average. Great progress!`
        });
    } else {
        insights.push({
            type: 'info',
            message: 'Expected spending is consistent with your average.'
        });
    }
    
    // Trend insights
    if (trend.trend === 'increasing') {
        insights.push({
            type: 'warning',
            message: `Your spending trend is increasing by ${trend.growth_rate.toFixed(1)}% per month.`
        });
    } else if (trend.trend === 'decreasing') {
        insights.push({
            type: 'positive',
            message: `Your spending trend is decreasing by ${Math.abs(trend.growth_rate).toFixed(1)}% per month.`
        });
    }
    
    // Volatility insights
    if (trend.volatility === 'high') {
        insights.push({
            type: 'info',
            message: 'Your spending is quite variable. Consider budgeting to stabilize expenses.'
        });
    }
    
    // Confidence insights
    if (prediction.confidence < 0.7) {
        insights.push({
            type: 'info',
            message: 'Prediction confidence is moderate. Add more expense data for better accuracy.'
        });
    }
    
    return insights;
}

module.exports = {
    generateExpensePrediction,
    generatePredictionInsights
};
