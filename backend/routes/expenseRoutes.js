const express = require("express");

const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect , addExpense);
router.get("/getAllExpense", protect , getAllExpense);
router.post("/downloadExpense", protect , downloadExpenseExcel);
router.delete("/deleteExpense", protect, deleteExpense);

module.exports = router;



