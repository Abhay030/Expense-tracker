const user = require('../models/User');
const Expense = require('../models/Expense');
const XLSX = require('xlsx');
const e = require('express');
const { categorizeExpenseWithAI, getAvailableCategories } = require('../services/aiCategorizationService');
const { processReceipt, validateAndImprove } = require('../services/ocrService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


// Add expense source
exports.addExpense = async (req, res) => {
    const userId = req.user._id;

    try{
        const{icon , category, amount, date} = req.body;

        // validation check for the missing fields
        if(!category || !amount || !date ){
            return res.status(400).json({message : 'Please fill all the fields'});
        }
        // create new income
        const newExpense = await Expense.create({
            userId,
            icon,
            category,
            amount,
            date
        })

        await newExpense.save();

        res.status(201).json({newExpense})
    }
    catch(error){
        res.status(500).json({message: 'Error creating Expense' , error: error.message});
    }
}

exports.getAllExpense = async (req, res) => {
    const userId = req.user._id;
    try{
        const expenses = await Expense.find({userId}).sort({date: -1});
        res.status(200).json({expenses});
    }
    catch(error){
        res.status(500).json({message: 'Error fetching expense' , error: error.message});
    }
}

exports.deleteExpense = async (req, res) => {

    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Expense deleted successfully'});
    }
    catch(error){
        res.status(500).json({message: 'Error deleting Expense' , error: error.message});
    }
}

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user._id;

    try{
        const expenses = await Expense.find({userId}).sort({date: -1});

        // prepare the data for excel
        const data = expenses.map(expense => ({
            Category: expense.category,
            Amount: expense.amount,
            Date: expense.date.toLocaleDateString(),
        }))

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
        
        // Write to buffer instead of file
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=expense_details.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        // Send the buffer
        res.send(buffer);
    }
    catch(error){
        res.status(500).json({message: 'Error downloading expense excel' , error: error.message});
    }
}

// AI Suggest Category based on description
exports.suggestCategory = async (req, res) => {
    try {
        const { description, amount } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required for AI categorization' });
        }

        // Get AI suggestion
        const suggestion = await categorizeExpenseWithAI(description, amount);

        res.status(200).json({
            success: true,
            suggestion
        });

    } catch (error) {
        console.error('Error suggesting category:', error);
        res.status(500).json({ 
            message: 'Error suggesting category', 
            error: error.message 
        });
    }
}

// Get available expense categories
exports.getCategories = async (req, res) => {
    try {
        const categories = getAvailableCategories();
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
}

// Configure multer for receipt image uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/receipts');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueName = `receipt-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Process receipt image with OCR
exports.uploadReceipt = upload.single('receipt');

exports.processReceiptOCR = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
        }
        
        const imagePath = req.file.path;
        
        // Process receipt with OCR
        const result = await processReceipt(imagePath);
        
        if (!result.success) {
            // Clean up uploaded file
            await fs.unlink(imagePath).catch(err => console.error('File cleanup error:', err));
            
            return res.status(400).json({
                success: false,
                message: 'Failed to process receipt',
                error: result.error
            });
        }
        
        // Validate and improve extracted data
        const improvedData = validateAndImprove(result.data);
        
        // Clean up uploaded file after processing
        await fs.unlink(imagePath).catch(err => console.error('File cleanup error:', err));
        
        res.json({
            success: true,
            data: improvedData,
            rawText: result.rawText,
            message: 'Receipt processed successfully'
        });
        
    } catch (error) {
        console.error('Receipt upload error:', error);
        
        // Clean up file if it exists
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
        }
        
        res.status(500).json({
            success: false,
            message: 'Error processing receipt',
            error: error.message
        });
    }
}
