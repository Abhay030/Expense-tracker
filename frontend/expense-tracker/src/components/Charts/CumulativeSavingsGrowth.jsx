import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LuTrendingUp, LuRefreshCw, LuTarget } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'

const CumulativeSavingsGrowth = ({ months = 12 }) => {
  const [loading, setLoading] = useState(false)
  const [savingsData, setSavingsData] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchSavingsData()
  }, [months])

  const fetchSavingsData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.INCOME_VS_EXPENSE}?months=${months}`
      )

      if (response.data.monthlyData) {
        processSavingsGrowth(response.data.monthlyData)
      }
    } catch (error) {
      console.error('Error fetching savings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processSavingsGrowth = (monthlyData) => {
    let cumulative = 0
    const cumulativeData = []
    let totalIncome = 0
    let totalExpense = 0
    let highestSavings = 0
    let lowestSavings = Infinity

    monthlyData.forEach(month => {
      const monthlySavings = month.income - month.expense
      cumulative += monthlySavings
      totalIncome += month.income
      totalExpense += month.expense

      if (cumulative > highestSavings) highestSavings = cumulative
      if (cumulative < lowestSavings) lowestSavings = cumulative

      cumulativeData.push({
        month: month.month,
        savings: cumulative,
        monthlyIncome: month.income,
        monthlyExpense: month.expense,
        monthlySavings: monthlySavings
      })
    })

    setSavingsData(cumulativeData)
    setStats({
      totalSavings: cumulative,
      averageMonthlySavings: cumulative / monthlyData.length,
      totalIncome,
      totalExpense,
      savingsRate: (cumulative / totalIncome) * 100,
      highestSavings,
      lowestSavings,
      trend: cumulative > 0 ? 'positive' : 'negative'
    })
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white shadow-lg rounded-lg p-4 border border-gray-200'>
          <p className='font-semibold text-gray-900 mb-2'>{data.month}</p>
          <div className='space-y-1 text-sm'>
            <p className='text-green-600'>
              Income: <span className='font-semibold'>${addThousandsSeparator(data.monthlyIncome.toFixed(0))}</span>
            </p>
            <p className='text-red-600'>
              Expense: <span className='font-semibold'>${addThousandsSeparator(data.monthlyExpense.toFixed(0))}</span>
            </p>
            <p className={data.monthlySavings >= 0 ? 'text-blue-600' : 'text-orange-600'}>
              Monthly: <span className='font-semibold'>${addThousandsSeparator(data.monthlySavings.toFixed(0))}</span>
            </p>
            <div className='border-t pt-2 mt-2'>
              <p className={`font-bold ${data.savings >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                Cumulative: ${addThousandsSeparator(data.savings.toFixed(0))}
              </p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <LuTrendingUp className='text-2xl text-indigo-600' />
          <h3 className='text-lg font-semibold'>Cumulative Savings Growth</h3>
        </div>
        <div className='flex items-center justify-center py-12'>
          <LuRefreshCw className='animate-spin text-3xl text-indigo-600' />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const getTrendColor = () => {
    if (stats.totalSavings > stats.highestSavings * 0.8) return '#10B981' // Green
    if (stats.totalSavings > 0) return '#3B82F6' // Blue
    if (stats.totalSavings > stats.lowestSavings * 0.5) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <LuTrendingUp className='text-2xl text-indigo-600' />
          <div>
            <h3 className='text-lg font-semibold'>Cumulative Savings Growth</h3>
            <p className='text-sm text-gray-600'>Net worth journey - Last {months} months</p>
          </div>
        </div>
        <button
          onClick={fetchSavingsData}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          title='Refresh'
        >
          <LuRefreshCw className='text-xl text-gray-600' />
        </button>
      </div>

      {/* Chart */}
      <div className='mb-6'>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={savingsData}>
            <defs>
              <linearGradient id='savingsGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={getTrendColor()} stopOpacity={0.8} />
                <stop offset='50%' stopColor={getTrendColor()} stopOpacity={0.3} />
                <stop offset='95%' stopColor={getTrendColor()} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
            <XAxis 
              dataKey='month' 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke='#D1D5DB'
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke='#D1D5DB'
              tickFormatter={(value) => `$${addThousandsSeparator(value)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke='#9CA3AF' strokeDasharray='5 5' label='Break Even' />
            <Area
              type='monotone'
              dataKey='savings'
              stroke={getTrendColor()}
              strokeWidth={3}
              fill='url(#savingsGradient)'
              dot={{ r: 4, fill: getTrendColor(), strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: getTrendColor() }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
        <div className={`p-4 rounded-lg border-2 ${stats.totalSavings >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className='flex items-center gap-2 mb-2'>
            <LuTarget className={stats.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'} />
            <p className={`text-xs font-semibold ${stats.totalSavings >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              Total Savings
            </p>
          </div>
          <p className={`text-2xl font-bold ${stats.totalSavings >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
            ${addThousandsSeparator(Math.abs(stats.totalSavings).toFixed(2))}
          </p>
          <p className={`text-xs mt-1 ${stats.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {stats.totalSavings >= 0 ? 'Accumulated' : 'Deficit'}
          </p>
        </div>

        <div className='p-4 bg-green-50 border-2 border-green-200 rounded-lg'>
          <p className='text-xs text-green-700 font-semibold mb-2'>Avg Monthly Savings</p>
          <p className='text-2xl font-bold text-green-900'>
            ${addThousandsSeparator(Math.abs(stats.averageMonthlySavings).toFixed(0))}
          </p>
          <p className='text-xs text-green-600 mt-1'>Per month</p>
        </div>

        <div className='p-4 bg-purple-50 border-2 border-purple-200 rounded-lg'>
          <p className='text-xs text-purple-700 font-semibold mb-2'>Savings Rate</p>
          <p className='text-2xl font-bold text-purple-900'>{stats.savingsRate.toFixed(1)}%</p>
          <p className='text-xs text-purple-600 mt-1'>Of total income</p>
        </div>

        <div className={`p-4 rounded-lg border-2 ${stats.trend === 'positive' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-xs font-semibold mb-2 ${stats.trend === 'positive' ? 'text-emerald-700' : 'text-orange-700'}`}>
            Trend
          </p>
          <div className='flex items-center gap-2'>
            <LuTrendingUp className={`text-3xl ${stats.trend === 'positive' ? 'text-emerald-600' : 'text-orange-600 rotate-180'}`} />
            <p className={`text-xl font-bold ${stats.trend === 'positive' ? 'text-emerald-900' : 'text-orange-900'}`}>
              {stats.trend === 'positive' ? 'Growing' : 'Declining'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-sm font-semibold text-gray-700'>Financial Health</p>
          <p className='text-sm text-gray-600'>{stats.savingsRate.toFixed(1)}% savings rate</p>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              stats.savingsRate >= 20 ? 'bg-green-500' :
              stats.savingsRate >= 10 ? 'bg-blue-500' :
              stats.savingsRate >= 5 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.savingsRate, 100)}%` }}
          />
        </div>
        <div className='flex justify-between mt-2 text-xs text-gray-600'>
          <span>0%</span>
          <span className='text-yellow-600'>5%</span>
          <span className='text-blue-600'>10%</span>
          <span className='text-green-600'>20%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Insights */}
      <div className='mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg'>
        <p className='text-sm font-semibold text-indigo-900 mb-2'>💡 Insights</p>
        <ul className='text-sm text-indigo-800 space-y-1'>
          {stats.savingsRate >= 20 && (
            <li>✨ Excellent! You're saving over 20% of your income.</li>
          )}
          {stats.savingsRate >= 10 && stats.savingsRate < 20 && (
            <li>👍 Good job! You're on track with 10%+ savings rate.</li>
          )}
          {stats.savingsRate < 10 && stats.savingsRate > 0 && (
            <li>⚠️ Try to increase your savings rate above 10%.</li>
          )}
          {stats.savingsRate < 0 && (
            <li>🚨 Warning: You're spending more than you earn.</li>
          )}
          {stats.trend === 'positive' ? (
            <li>📈 Your savings are growing over time - keep it up!</li>
          ) : (
            <li>📉 Your savings are declining - review your expenses.</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default CumulativeSavingsGrowth
