const express = require("express");

const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
    suggestCategory,
    getCategories,
    uploadReceipt,
    processReceiptOCR
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect , addExpense);
router.get("/getAllExpense", protect , getAllExpense);
router.get("/downloadexcel", protect , downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);
router.post("/suggest-category", protect, suggestCategory);
router.get("/categories", protect, getCategories);
router.post("/upload-receipt", protect, uploadReceipt, processReceiptOCR);

module.exports = router;



