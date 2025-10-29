const OpenAI = require('openai');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI-powered expense summary with insights and recommendations
 */
async function generateExpenseSummary(userId) {
    try {
        // Get current month data
        const currentMonthData = await getMonthlyData(userId, 0);
        
        // Get previous month data for comparison
        const previousMonthData = await getMonthlyData(userId, 1);
        
        // Calculate insights
        const insights = calculateInsights(currentMonthData, previousMonthData);
        
        // Generate AI summary using OpenAI
        const aiSummary = await generateAISummary(insights);
        
        return {
            success: true,
            summary: aiSummary,
            data: {
                currentMonth: currentMonthData,
                previousMonth: previousMonthData,
                insights: insights
            }
        };
        
    } catch (error) {
        console.error('Error generating expense summary:', error);
        
        // Fallback to basic summary
        return generateBasicSummary(userId);
    }
}

/**
 * Get monthly income and expense data
 */
async function getMonthlyData(userId, monthsAgo = 0) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);
    
    // Get expenses
    const expenses = await Expense.find({
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
    });
    
    // Get income
    const incomes = await Income.find({
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate totals
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Group by category
    const categoryBreakdown = {};
    expenses.forEach(exp => {
        if (!categoryBreakdown[exp.category]) {
            categoryBreakdown[exp.category] = { total: 0, count: 0 };
        }
        categoryBreakdown[exp.category].total += exp.amount;
        categoryBreakdown[exp.category].count += 1;
    });
    
    // Sort categories by amount
    const topCategories = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)
        .map(([category, data]) => ({
            category,
            amount: data.total,
            count: data.count,
            percentage: totalExpense > 0 ? ((data.total / totalExpense) * 100).toFixed(1) : 0
        }));
    
    return {
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalExpense,
        totalIncome,
        savings: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
        categoryBreakdown: topCategories,
        transactionCount: expenses.length
    };
}

/**
 * Calculate insights by comparing current and previous month
 */
function calculateInsights(currentMonth, previousMonth) {
    const insights = {
        expenseChange: 0,
        expenseChangePercent: 0,
        incomeChange: 0,
        incomeChangePercent: 0,
        savingsChange: 0,
        topSpendingCategory: null,
        categoryChanges: [],
        trend: 'stable'
    };
    
    // Calculate expense change
    insights.expenseChange = currentMonth.totalExpense - previousMonth.totalExpense;
    insights.expenseChangePercent = previousMonth.totalExpense > 0 
        ? ((insights.expenseChange / previousMonth.totalExpense) * 100).toFixed(1)
        : 0;
    
    // Calculate income change
    insights.incomeChange = currentMonth.totalIncome - previousMonth.totalIncome;
    insights.incomeChangePercent = previousMonth.totalIncome > 0
        ? ((insights.incomeChange / previousMonth.totalIncome) * 100).toFixed(1)
        : 0;
    
    // Calculate savings change
    insights.savingsChange = currentMonth.savings - previousMonth.savings;
    
    // Top spending category
    if (currentMonth.categoryBreakdown.length > 0) {
        insights.topSpendingCategory = currentMonth.categoryBreakdown[0];
    }
    
    // Calculate category changes
    const prevCategories = new Map(
        previousMonth.categoryBreakdown.map(cat => [cat.category, cat.amount])
    );
    
    currentMonth.categoryBreakdown.forEach(currentCat => {
        const prevAmount = prevCategories.get(currentCat.category) || 0;
        const change = currentCat.amount - prevAmount;
        const changePercent = prevAmount > 0 ? ((change / prevAmount) * 100).toFixed(1) : 0;
        
        if (Math.abs(changePercent) > 10) { // Only significant changes
            insights.categoryChanges.push({
                category: currentCat.category,
                change,
                changePercent,
                currentAmount: currentCat.amount,
                previousAmount: prevAmount
            });
        }
    });
    
    // Sort by absolute change percent
    insights.categoryChanges.sort((a, b) => 
        Math.abs(b.changePercent) - Math.abs(a.changePercent)
    );
    
    // Determine overall trend
    if (insights.savingsChange > 0 && Math.abs(insights.savingsChange) > 50) {
        insights.trend = 'improving';
    } else if (insights.savingsChange < 0 && Math.abs(insights.savingsChange) > 50) {
        insights.trend = 'concerning';
    } else {
        insights.trend = 'stable';
    }
    
    return insights;
}

/**
 * Generate AI summary using OpenAI
 */
async function generateAISummary(insights) {
    const prompt = createSummaryPrompt(insights);
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a friendly personal finance advisor. Provide clear, actionable advice in a conversational but professional tone. Keep responses concise (2-3 sentences max). Focus on the most important insights.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });
        
        const summary = response.choices[0].message.content.trim();
        
        return {
            text: summary,
            source: 'openai',
            timestamp: new Date()
        };
        
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
}

/**
 * Create prompt for OpenAI
 */
function createSummaryPrompt(insights) {
    const { 
        expenseChange, 
        expenseChangePercent, 
        savingsChange,
        topSpendingCategory,
        categoryChanges,
        trend 
    } = insights;
    
    let prompt = `Generate a personalized financial summary based on this data:\n\n`;
    
    // Overall trend
    prompt += `Overall Trend: ${trend}\n`;
    
    // Expense change
    if (Math.abs(expenseChangePercent) > 5) {
        const direction = expenseChange > 0 ? 'increased' : 'decreased';
        prompt += `- Expenses ${direction} by ${Math.abs(expenseChangePercent)}% compared to last month\n`;
    }
    
    // Top spending category
    if (topSpendingCategory) {
        prompt += `- Top spending category: ${topSpendingCategory.category} (${topSpendingCategory.percentage}% of total)\n`;
    }
    
    // Significant category changes
    if (categoryChanges.length > 0) {
        const topChange = categoryChanges[0];
        const direction = topChange.change > 0 ? 'increased' : 'decreased';
        prompt += `- ${topChange.category} ${direction} by ${Math.abs(topChange.changePercent)}%\n`;
    }
    
    // Savings trend
    if (savingsChange !== 0) {
        const direction = savingsChange > 0 ? 'increased' : 'decreased';
        prompt += `- Savings ${direction} by $${Math.abs(savingsChange).toFixed(2)}\n`;
    }
    
    prompt += `\nProvide a friendly, actionable summary with 1-2 specific recommendations.`;
    
    return prompt;
}

/**
 * Generate basic summary without AI (fallback)
 */
async function generateBasicSummary(userId) {
    try {
        const currentMonthData = await getMonthlyData(userId, 0);
        const previousMonthData = await getMonthlyData(userId, 1);
        const insights = calculateInsights(currentMonthData, previousMonthData);
        
        // Generate basic text summary
        let summaryText = '';
        
        if (Math.abs(insights.expenseChangePercent) > 5) {
            const direction = insights.expenseChange > 0 ? 'increased' : 'decreased';
            summaryText += `Your expenses ${direction} by ${Math.abs(insights.expenseChangePercent)}% this month. `;
        }
        
        if (insights.topSpendingCategory) {
            summaryText += `Most spending was on ${insights.topSpendingCategory.category} (${insights.topSpendingCategory.percentage}%). `;
        }
        
        if (insights.categoryChanges.length > 0) {
            const topChange = insights.categoryChanges[0];
            const direction = topChange.change > 0 ? 'increased' : 'decreased';
            summaryText += `${topChange.category} ${direction} significantly by ${Math.abs(topChange.changePercent)}%. `;
        }
        
        if (!summaryText) {
            summaryText = 'Your spending patterns are consistent with last month. Keep up the good work!';
        }
        
        return {
            success: true,
            summary: {
                text: summaryText,
                source: 'basic',
                timestamp: new Date()
            },
            data: {
                currentMonth: currentMonthData,
                previousMonth: previousMonthData,
                insights: insights
            }
        };
        
    } catch (error) {
        console.error('Error generating basic summary:', error);
        return {
            success: false,
            summary: {
                text: 'Unable to generate summary at this time. Please try again later.',
                source: 'error',
                timestamp: new Date()
            }
        };
    }
}

module.exports = {
    generateExpenseSummary
};
