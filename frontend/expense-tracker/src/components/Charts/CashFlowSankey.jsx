import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuArrowRightLeft, LuRefreshCw } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'

const CashFlowSankey = ({ months = 1 }) => {
  const [loading, setLoading] = useState(false)
  const [flowData, setFlowData] = useState(null)

  useEffect(() => {
    fetchCashFlowData()
  }, [months])

  const fetchCashFlowData = async () => {
    setLoading(true)
    try {
      // Fetch income and expense data
      const [expenseRes, incomeRes] = await Promise.all([
        axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}?months=${months}`),
        axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}?months=${months}`)
      ])

      processCashFlow(expenseRes.data.expenses || [], incomeRes.data.incomes || [])
    } catch (error) {
      console.error('Error fetching cash flow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processCashFlow = (expenses, incomes) => {
    // Calculate total income by category
    const incomeByCategory = {}
    let totalIncome = 0

    incomes.forEach(income => {
      const category = income.category || 'Other Income'
      incomeByCategory[category] = (incomeByCategory[category] || 0) + income.amount
      totalIncome += income.amount
    })

    // Calculate total expense by category
    const expenseByCategory = {}
    let totalExpense = 0

    expenses.forEach(expense => {
      const category = expense.category || 'Other'
      expenseByCategory[category] = (expenseByCategory[category] || 0) + expense.amount
      totalExpense += expense.amount
    })

    const savings = totalIncome - totalExpense

    setFlowData({
      incomeByCategory,
      expenseByCategory,
      totalIncome,
      totalExpense,
      savings
    })
  }

  const getColorForCategory = (category, type) => {
    const incomeColors = {
      'Salary': '#059669',
      'Freelance': '#10B981',
      'Business': '#34D399',
      'Investment': '#6EE7B7',
      'Other Income': '#86EFAC'
    }

    const expenseColors = {
      'Food & Dining': '#DC2626',
      'food': '#DC2626',
      'Food': '#DC2626',
      'Transportation': '#EA580C',
      'Housing & Utilities': '#D97706',
      'Shopping': '#DB2777',
      'bike': '#C026D3',
      'Healthcare': '#7C3AED',
      'Entertainment': '#2563EB',
      'Education': '#0891B2',
      'Travel': '#0D9488',
      'Groceries': '#F59E0B',
      'love': '#EC4899',
      'burger': '#EF4444',
      'Games': '#8B5CF6',
      'Mall': '#A855F7',
      'randibazaar': '#F97316',
      'Other': '#64748B'
    }

    if (type === 'income') {
      return incomeColors[category] || '#10B981'
    } else {
      return expenseColors[category] || expenseColors[category.toLowerCase()] || '#DC2626'
    }
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <LuArrowRightLeft className='text-2xl text-indigo-600' />
          <h3 className='text-lg font-semibold'>Cash Flow Diagram</h3>
        </div>
        <div className='flex items-center justify-center py-12'>
          <LuRefreshCw className='animate-spin text-3xl text-indigo-600' />
        </div>
      </div>
    )
  }

  if (!flowData) return null

  const { incomeByCategory, expenseByCategory, totalIncome, totalExpense, savings } = flowData

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <LuArrowRightLeft className='text-2xl text-indigo-600' />
          <div>
            <h3 className='text-lg font-semibold'>Cash Flow Diagram</h3>
            <p className='text-sm text-gray-600'>Money flow visualization - Last {months} month{months > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={fetchCashFlowData}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          title='Refresh'
        >
          <LuRefreshCw className='text-xl text-gray-600' />
        </button>
      </div>

      {/* SVG Sankey-style Flow */}
      <div className='relative' style={{ minHeight: '400px' }}>
        <svg width='100%' height='400' viewBox='0 0 800 400' preserveAspectRatio='xMidYMid meet'>
          <defs>
            {/* Gradients for flows */}
            {Object.keys(expenseByCategory).map((category, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#60A5FA' stopOpacity='0.6' />
                <stop offset='100%' stopColor={getColorForCategory(category, 'expense')} stopOpacity='0.8' />
              </linearGradient>
            ))}
          </defs>

          {/* Left Column - Income Sources */}
          <g transform='translate(50, 50)'>
            <text x='0' y='-20' className='text-sm font-semibold' fill='#374151'>
              Income Sources
            </text>
            {Object.entries(incomeByCategory).map(([category, amount], index) => {
              const yPos = index * 60
              const height = (amount / totalIncome) * 200 + 20
              
              return (
                <g key={index} transform={`translate(0, ${yPos})`}>
                  <rect
                    x='0'
                    y='0'
                    width='150'
                    height={height}
                    fill={getColorForCategory(category, 'income')}
                    rx='8'
                    opacity='0.8'
                  />
                  <text x='75' y={height / 2} textAnchor='middle' fill='white' className='text-xs font-semibold'>
                    {category}
                  </text>
                  <text x='75' y={height / 2 + 15} textAnchor='middle' fill='white' className='text-xs'>
                    ${addThousandsSeparator(amount.toFixed(0))}
                  </text>
                </g>
              )
            })}
          </g>

          {/* Center - Total Pool */}
          <g transform='translate(350, 50)'>
            <rect
              x='0'
              y='0'
              width='100'
              height='250'
              fill='#3B82F6'
              rx='12'
              opacity='0.2'
            />
            <text x='50' y='100' textAnchor='middle' fill='#1F2937' className='text-xs font-semibold'>
              Total
            </text>
            <text x='50' y='120' textAnchor='middle' fill='#1F2937' className='text-lg font-bold'>
              ${addThousandsSeparator(totalIncome.toFixed(0))}
            </text>
            <text x='50' y='160' textAnchor='middle' fill='#059669' className='text-xs font-semibold'>
              Savings
            </text>
            <text x='50' y='175' textAnchor='middle' fill='#059669' className='text-sm font-bold'>
              ${addThousandsSeparator(savings.toFixed(0))}
            </text>
          </g>

          {/* Right Column - Expense Categories */}
          <g transform='translate(600, 30)'>
            <text x='75' y='-10' textAnchor='middle' className='text-sm font-semibold' fill='#374151'>
              Expenses
            </text>
            {Object.entries(expenseByCategory).map(([category, amount], index) => {
              // Calculate spacing to prevent overlap
              const totalCategories = Object.keys(expenseByCategory).length
              const availableHeight = 320
              const spacing = Math.min(40, availableHeight / totalCategories)
              const yPos = index * spacing
              const height = Math.max(25, Math.min(35, (amount / totalExpense) * 100))
              
              return (
                <g key={index} transform={`translate(0, ${yPos})`}>
                  <rect
                    x='0'
                    y='0'
                    width='150'
                    height={height}
                    fill={getColorForCategory(category, 'expense')}
                    rx='8'
                    opacity='0.9'
                  />
                  <text 
                    x='75' 
                    y={height / 2 + 2} 
                    textAnchor='middle' 
                    fill='white' 
                    className='text-xs font-semibold'
                    style={{ fontSize: '11px' }}
                  >
                    {category.length > 15 ? category.substring(0, 13) + '...' : category}
                  </text>
                  <text 
                    x='75' 
                    y={height / 2 + 14} 
                    textAnchor='middle' 
                    fill='white' 
                    className='text-xs'
                    style={{ fontSize: '10px' }}
                  >
                    ${addThousandsSeparator(amount.toFixed(0))}
                  </text>
                </g>
              )
            })}
          </g>

          {/* Flow Lines - Income to Center */}
          {Object.entries(incomeByCategory).map(([category, amount], index) => {
            const yStart = 50 + index * 60 + ((amount / totalIncome) * 200 + 20) / 2
            const yEnd = 50 + 125
            
            return (
              <path
                key={`income-${index}`}
                d={`M 200 ${yStart} Q 275 ${yStart}, 350 ${yEnd}`}
                fill='none'
                stroke={getColorForCategory(category, 'income')}
                strokeWidth={(amount / totalIncome) * 60 + 2}
                opacity='0.3'
              />
            )
          })}

          {/* Flow Lines - Center to Expenses */}
          {Object.entries(expenseByCategory).map(([category, amount], index) => {
            const totalCategories = Object.keys(expenseByCategory).length
            const availableHeight = 320
            const spacing = Math.min(40, availableHeight / totalCategories)
            const height = Math.max(25, Math.min(35, (amount / totalExpense) * 100))
            const yStart = 50 + 125
            const yEnd = 30 + index * spacing + height / 2
            
            return (
              <path
                key={`expense-${index}`}
                d={`M 450 ${yStart} Q 525 ${yEnd}, 600 ${yEnd}`}
                fill='none'
                stroke={getColorForCategory(category, 'expense')}
                strokeWidth={Math.max(2, Math.min(15, (amount / totalExpense) * 50))}
                opacity='0.4'
              />
            )
          })}
        </svg>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-3 gap-4 mt-6'>
        <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-xs text-green-700 font-semibold mb-1'>Total Income</p>
          <p className='text-2xl font-bold text-green-900'>${addThousandsSeparator(totalIncome.toFixed(2))}</p>
          <p className='text-xs text-green-600 mt-1'>{Object.keys(incomeByCategory).length} sources</p>
        </div>
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-xs text-red-700 font-semibold mb-1'>Total Expenses</p>
          <p className='text-2xl font-bold text-red-900'>${addThousandsSeparator(totalExpense.toFixed(2))}</p>
          <p className='text-xs text-red-600 mt-1'>{Object.keys(expenseByCategory).length} categories</p>
        </div>
        <div className={`p-4 ${savings >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg`}>
          <p className={`text-xs font-semibold mb-1 ${savings >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Savings</p>
          <p className={`text-2xl font-bold ${savings >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            ${addThousandsSeparator(Math.abs(savings).toFixed(2))}
          </p>
          <p className={`text-xs mt-1 ${savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {savings >= 0 ? `${((savings / totalIncome) * 100).toFixed(1)}% saved` : 'Deficit'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CashFlowSankey
