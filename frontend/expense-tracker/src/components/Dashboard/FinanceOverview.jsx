import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
import { addThousandsSeparator } from '../../utils/helper'

const COLORS = ["#6366f1", "#f43f5e", "#10b981"] // Indigo, Rose, Emerald

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
    const balanceData = [
        { name: "Total Balance", amount: totalBalance },
        { name: "Total Expense", amount: totalExpense },
        { name: "Total Income", amount: totalIncome }
    ]
    return (
        <div className='card hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
                <h5 className='text-[16px] font-semibold text-slate-800'>Financial Overview</h5>
            </div>

            <CustomPieChart data={balanceData} label="Total Balance" totalAmount={addThousandsSeparator(totalBalance)} colors={COLORS} showTextAnchor />
        </div>
    )
}

export default FinanceOverview