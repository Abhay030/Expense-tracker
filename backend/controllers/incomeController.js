const user = require('../models/User');
const Income = require('../models/Income');
const XLSX = require('xlsx');

exports.addIncome = async (req, res) => {
    const userId = req.user._id;

    try{
        const{icon , source, amount, date} = req.body;

        // validation check for the missing fields
        if(!source || !amount || !date){
            return res.status(400).json({message : 'Please fill all the fields'});
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

        res.status(201).json({newIncome})
    }
    catch(error){
        res.status(500).json({message: 'Error creating income' , error: error.message});
    }
}

exports.getAllIncome = async (req, res) => {
    const userId = req.user._id;
    try{
        const incomes = await Income.find({userId}).sort({date: -1});
        res.status(200).json({incomes});
    }
    catch(error){
        res.status(500).json({message: 'Error fetching incomes' , error: error.message});
    }
}

exports.deleteIncome = async (req, res) => {

    try{
        await Income.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Income deleted successfully'});
    }
    catch(error){
        res.status(500).json({message: 'Error deleting income' , error: error.message});
    }
}

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user._id;

    try{
        const incomes = await Income.find({userId}).sort({date: -1});

        // prepare the data for excel
        const data = incomes.map(incomes => ({
            Source: incomes.source,
            Amount: incomes.amount,
            Date: incomes.date.toLocaleDateString(),
        }))

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incomes');
        XLSX.writeFile(workbook, 'incomes_details.xlsx');
        res.download('incomes_details.xlsx', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            } else {
                console.log('File downloaded successfully');
            }
        });
    }
    catch(error){
        res.status(500).json({message: 'Error downloading income excel' , error: error.message});
    }
}