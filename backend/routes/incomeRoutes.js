const express = require('express');

const {
    addIncome,
    getAllIncome,
    deleteIncome,
    downloadIncomeExcel,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const router = express.Router();

router.post('/add', protect, validate('addIncome'), addIncome);
router.get('/get', protect, getAllIncome);
router.delete('/:id', protect, deleteIncome);
router.get('/downloadexcel', protect, downloadIncomeExcel);

module.exports = router;
