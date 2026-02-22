const express = require('express')
const { protect } = require("../middleware/authMiddleware")
const { getDashBoardData, getAIExpenseSummary } = require("../controllers/dashboardController");
const cache = require("../middleware/cache");

const router = express.Router();

// Disabled caching entirely for MVP real-time UX
router.get("/", protect, getDashBoardData);

// Disabled caching entirely for MVP real-time UX
router.get("/ai-summary", protect, getAIExpenseSummary);

module.exports = router;