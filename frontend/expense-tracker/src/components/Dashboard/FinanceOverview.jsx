import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
import { addThousandsSeparator } from '../../utils/helper'

const COLORS = ["#8B5CF6", "#EF4444", "#10B981"] // Violet, Red, Emerald

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
    const balanceData = [
        { name: "Total Balance", amount: totalBalance },
        { name: "Total Expense", amount: totalExpense },
        { name: "Total Income", amount: totalIncome }
    ]
    return (
        <div className='card hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-2'>
                <h5 className='text-[16px] font-semibold' style={{ color: '#F1F5F9' }}>Financial Overview</h5>
            </div>

            <CustomPieChart data={balanceData} label="Total Balance" totalAmount={addThousandsSeparator(totalBalance)} colors={COLORS} showTextAnchor />
        </div>
    )
}

export default FinanceOverview