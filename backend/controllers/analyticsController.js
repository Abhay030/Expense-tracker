const { Types } = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Get spending trends (daily/weekly/monthly)
exports.getSpendingTrends = async (req, res) => {
    try {
        
        const userId = req.user._id;
        const { period = 'monthly', months = 6 } = req.query; // monthly, weekly, daily

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        let groupBy;
        if (period === 'daily') {
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        } else if (period === 'weekly') {
            groupBy = { $dateToString: { format: "%Y-W%V", date: "$date" } };
        } else {
            groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        }

        const expenseTrends = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const incomeTrends = await Income.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            period,
            expenses: expenseTrends,
            income: incomeTrends
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching spending trends", error: error.message });
    }
};

// Get category breakdown with percentages
exports.getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user._id;
        const { months = 3 } = req.query;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        const categoryBreakdown = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        const totalExpense = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);

        const breakdownWithPercentage = categoryBreakdown.map(cat => ({
            category: cat._id,
            total: cat.total,
            count: cat.count,
            percentage: totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(2) : 0
        }));

        res.json({
            breakdown: breakdownWithPercentage,
            totalExpense
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching category breakdown", error: error.message });
    }
};

// Get income vs expense comparison by month
exports.getIncomeVsExpenseByMonth = async (req, res) => {
    try {
        const userId = req.user._id;
        const { months = 12 } = req.query;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyIncome = await Income.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge the data
        const incomeMap = new Map(monthlyIncome.map(item => [item._id, item.total]));
        const expenseMap = new Map(monthlyExpenses.map(item => [item._id, item.total]));

        const allMonths = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
        const comparison = Array.from(allMonths).sort().map(month => ({
            month,
            income: incomeMap.get(month) || 0,
            expense: expenseMap.get(month) || 0,
            savings: (incomeMap.get(month) || 0) - (expenseMap.get(month) || 0),
            savingsRate: incomeMap.get(month) > 0 
                ? (((incomeMap.get(month) || 0) - (expenseMap.get(month) || 0)) / incomeMap.get(month) * 100).toFixed(2)
                : 0
        }));

        res.json({ comparison });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching income vs expense", error: error.message });
    }
};

// Get savings rate
exports.getSavingsRate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { months = 6 } = req.query;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        const totalIncome = await Income.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const totalExpense = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const income = totalIncome[0]?.total || 0;
        const expense = totalExpense[0]?.total || 0;
        const savings = income - expense;
        const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(2) : 0;

        res.json({
            income,
            expense,
            savings,
            savingsRate,
            period: `Last ${months} months`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error calculating savings rate", error: error.message });
    }
};

// Year-over-year comparison
exports.getYearOverYearComparison = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        // Get current year data
        const currentYearStart = new Date(`${currentYear}-01-01`);
        const currentYearEnd = new Date(`${currentYear}-12-31`);

        const currentYearExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: currentYearStart, $lte: currentYearEnd }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const currentYearIncome = await Income.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: currentYearStart, $lte: currentYearEnd }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get previous year data
        const previousYearStart = new Date(`${previousYear}-01-01`);
        const previousYearEnd = new Date(`${previousYear}-12-31`);

        const previousYearExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: previousYearStart, $lte: previousYearEnd }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const previousYearIncome = await Income.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(String(userId)),
                    date: { $gte: previousYearStart, $lte: previousYearEnd }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format the data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const comparison = monthNames.map((month, index) => {
            const currentExpense = currentYearExpenses.find(e => e._id === index + 1)?.total || 0;
            const currentIncome = currentYearIncome.find(i => i._id === index + 1)?.total || 0;
            const previousExpense = previousYearExpenses.find(e => e._id === index + 1)?.total || 0;
            const previousIncome = previousYearIncome.find(i => i._id === index + 1)?.total || 0;

            return {
                month,
                currentYear: {
                    income: currentIncome,
                    expense: currentExpense,
                    savings: currentIncome - currentExpense
                },
                previousYear: {
                    income: previousIncome,
                    expense: previousExpense,
                    savings: previousIncome - previousExpense
                },
                growth: {
                    income: previousIncome > 0 ? (((currentIncome - previousIncome) / previousIncome) * 100).toFixed(2) : 0,
                    expense: previousExpense > 0 ? (((currentExpense - previousExpense) / previousExpense) * 100).toFixed(2) : 0
                }
            };
        });

        res.json({
            currentYear,
            previousYear,
            comparison
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching year-over-year comparison", error: error.message });
    }
};
