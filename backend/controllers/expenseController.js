const Expense = require('../models/Expense');
const XLSX = require('xlsx');
const cache = require('../middleware/cache');
const { categorizeExpenseWithAI, getAvailableCategories } = require('../services/aiCategorizationService');
const { processReceipt, validateAndImprove } = require('../services/ocrService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


// Add expense source
exports.addExpense = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, category, amount, date } = req.body;

        // validation check for the missing fields
        if (!category || !amount || !date) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        // create new expense
        const newExpense = await Expense.create({
            userId,
            icon,
            category,
            amount,
            date
        })

        // Invalidate cached dashboard/analytics data
        cache.invalidateUser(userId);

        res.status(201).json({ newExpense })
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating Expense', error: error.message });
    }
}

exports.getAllExpense = async (req, res) => {
    const userId = req.user._id;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0; // 0 = no limit (backward compatible)
        const skip = limit > 0 ? (page - 1) * limit : 0;

        // Build date filter from query params (used by heatmap & sankey)
        const filter = { userId };
        if (req.query.startDate || req.query.endDate) {
            filter.date = {};
            if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
        } else if (req.query.months) {
            const months = parseInt(req.query.months);
            const since = new Date();
            since.setMonth(since.getMonth() - months);
            filter.date = { $gte: since };
        }

        let query = Expense.find(filter).sort({ date: -1 }).lean();
        if (limit > 0) {
            query = query.skip(skip).limit(limit);
        }
        const expenses = await query;

        const total = limit > 0 ? await Expense.countDocuments(filter) : expenses.length;

        res.status(200).json({
            expenses,
            ...(limit > 0 && { pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error: error.message });
    }
}

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense record not found' });
        }

        // Authorization: ensure the record belongs to the logged-in user
        if (expense.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this record' });
        }

        await Expense.findByIdAndDelete(req.params.id);
        cache.invalidateUser(req.user._id);
        res.status(200).json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting Expense', error: error.message });
    }
}

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user._id;

    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

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
    catch (error) {
        res.status(500).json({ message: 'Error downloading expense excel', error: error.message });
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
