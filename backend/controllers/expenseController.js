const user = require('../models/User');
const Expense = require('../models/Expense');
const XLSX = require('xlsx');
const e = require('express');


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
