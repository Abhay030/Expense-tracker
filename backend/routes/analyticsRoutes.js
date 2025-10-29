const express = require("express");
const {
    getSpendingTrends,
    getCategoryBreakdown,
    getIncomeVsExpenseByMonth,
    getSavingsRate,
    getYearOverYearComparison,
    getExpensePrediction
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/spending-trends", protect, getSpendingTrends);
router.get("/category-breakdown", protect, getCategoryBreakdown);
router.get("/income-vs-expense", protect, getIncomeVsExpenseByMonth);
router.get("/savings-rate", protect, getSavingsRate);
router.get("/year-comparison", protect, getYearOverYearComparison);
router.get("/prediction", protect, getExpensePrediction);

module.exports = router;
