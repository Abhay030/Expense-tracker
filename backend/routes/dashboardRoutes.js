const express = require('express')
const {protect} = require("../middleware/authMiddleware")
const {getDashBoardData, getAIExpenseSummary} = require("../controllers/dashboardController");

const router = express.Router();
router.get("/"  , protect, getDashBoardData);
router.get("/ai-summary", protect, getAIExpenseSummary);

module.exports = router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTU5M2Y5NjYyYTdkYTZhNjhiY2MwOCIsImlhdCI6MTc0NjI0NjE2OCwiZXhwIjoxNzQ2MjQ5NzY4fQ.yuw_lvfGljYmsbFtqlfLwwkFu2x1BH4XA46nYICdUfM