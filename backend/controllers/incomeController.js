const user = require('../models/User');
const Income = require('../models/Income');
const XLSX = require('xlsx');
const cache = require('../middleware/cache');

exports.addIncome = async (req, res) => {
    const userId = req.user._id;

    try {
        const { icon, source, amount, date } = req.body;

        // validation check for the missing fields
        if (!source || !amount || !date) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        // create new income
        const newIncome = await Income.create({
            userId,
            icon,
            source,
            amount,
            date
        })

        await newIncome.save();

        // Invalidate cached dashboard/analytics data for this user
        cache.invalidateUser(userId);

        res.status(201).json({ newIncome })
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating income', error: error.message });
    }
}

exports.getAllIncome = async (req, res) => {
    const userId = req.user._id;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0; // 0 = no limit (backward compatible)
        const skip = limit > 0 ? (page - 1) * limit : 0;

        let query = Income.find({ userId }).sort({ date: -1 }).lean();
        if (limit > 0) {
            query = query.skip(skip).limit(limit);
        }
        const incomes = await query;

        const total = limit > 0 ? await Income.countDocuments({ userId }) : incomes.length;

        res.status(200).json({
            incomes,
            ...(limit > 0 && { pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching incomes', error: error.message });
    }
}

exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ message: 'Income record not found' });
        }

        // Authorization: ensure the record belongs to the logged-in user
        if (income.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this record' });
        }

        await Income.findByIdAndDelete(req.params.id);
        cache.invalidateUser(req.user._id);
        res.status(200).json({ message: 'Income deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting income', error: error.message });
    }
}

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user._id;

    try {
        const incomes = await Income.find({ userId }).sort({ date: -1 });

        // prepare the data for excel
        const data = incomes.map(item => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toLocaleDateString(),
        }))

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incomes');

        // Write to buffer instead of file (works in serverless & avoids temp files)
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=income_details.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send the buffer
        res.send(buffer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error downloading income excel', error: error.message });
    }
}
