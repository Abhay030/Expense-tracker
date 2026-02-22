const express = require('express')
const { protect } = require("../middleware/authMiddleware")
const { getDashBoardData, getAIExpenseSummary } = require("../controllers/dashboardController");

const router = express.Router();
router.get("/", protect, getDashBoardData);
router.get("/ai-summary", protect, getAIExpenseSummary);

module.exports = router;