import React, { useEffect, useState } from 'react'
import { prepareExpenseLineChartData } from '../../utils/helper';
import { LuPlus } from 'react-icons/lu';
import CustomLineChart from '../Charts/CustomLineChart';
import Modal from '../Modal';
import AddExpenseForm from './AddExpenseForm';

const ExpenseOverview = ({transactions , onExpenseIncome}) => {
    const [charData , setChartData] = useState([]);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

    useEffect(() => {
        const result = prepareExpenseLineChartData(transactions);
        setChartData(result);

        return () => {};
    }, [transactions]);


  return (
    <div className='card'>
        <div className='flex items-center justify-between '>
            <div className="">
                <h5 className="text-lg">Expense Overview</h5>
                <p className="text-xs text-gray-400 mt-0.5">
                    Track your spending trends and gain your financial insights over time. 
                </p>
            </div>
            <button className="add-btn" onClick={onExpenseIncome}>
                <LuPlus className="text-lg" />
                Add Expense
            </button>
        </div>

        <div className="">
            <CustomLineChart data={charData}/>
        </div>

        
    </div>
  )
}

export default ExpenseOverview