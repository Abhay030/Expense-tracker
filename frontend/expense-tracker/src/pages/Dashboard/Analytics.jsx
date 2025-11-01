import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LuTrendingUp, LuCircle, LuActivity, LuWallet } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'
import PredictionChart from '../../components/Predictions/PredictionChart'
import ExpenseHeatmapCalendar from '../../components/Charts/ExpenseHeatmapCalendar'
import CashFlowSankey from '../../components/Charts/CashFlowSankey'
import CumulativeSavingsGrowth from '../../components/Charts/CumulativeSavingsGrowth'

const Analytics = () => {
  useUserAuth()

  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const [months, setMonths] = useState(6)
  
  const [spendingTrends, setSpendingTrends] = useState(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState(null)
  const [incomeVsExpense, setIncomeVsExpense] = useState(null)
  const [savingsRate, setSavingsRate] = useState(null)
  const [yearComparison, setYearComparison] = useState(null)

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#EAB308']

  // Fetch Spending Trends
  const fetchSpendingTrends = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.SPENDING_TRENDS}?period=${period}&months=${months}`
      )
      setSpendingTrends(response.data)
    } catch (error) {
      console.error('Error fetching spending trends:', error)
    }
  }

  // Fetch Category Breakdown
  const fetchCategoryBreakdown = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.CATEGORY_BREAKDOWN}?months=${months}`
      )
      setCategoryBreakdown(response.data)
    } catch (error) {
      console.error('Error fetching category breakdown:', error)
    }
  }

  // Fetch Income vs Expense
  const fetchIncomeVsExpense = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.INCOME_VS_EXPENSE}?months=${months}`
      )
      setIncomeVsExpense(response.data)
    } catch (error) {
      console.error('Error fetching income vs expense:', error)
    }
  }

  // Fetch Savings Rate
  const fetchSavingsRate = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.SAVINGS_RATE}?months=${months}`
      )
      setSavingsRate(response.data)
    } catch (error) {
      console.error('Error fetching savings rate:', error)
    }
  }

  // Fetch Year Comparison
  const fetchYearComparison = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ANALYTICS.YEAR_COMPARISON)
      setYearComparison(response.data)
    } catch (error) {
      console.error('Error fetching year comparison:', error)
    }
  }

  // Fetch all analytics data
  const fetchAllAnalytics = async () => {
    if (loading) return
    setLoading(true)
    
    try {
      await Promise.all([
        fetchSpendingTrends(),
        fetchCategoryBreakdown(),
        fetchIncomeVsExpense(),
        fetchSavingsRate(),
        fetchYearComparison()
      ])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAnalytics()
  }, [period, months])

  // Format spending trends data for chart
  const formatSpendingTrendsData = () => {
    if (!spendingTrends) return []
    
    const expenseMap = new Map(spendingTrends.expenses.map(e => [e._id, e.total]))
    const incomeMap = new Map(spendingTrends.income.map(i => [i._id, i.total]))
    
    const allPeriods = new Set([...expenseMap.keys(), ...incomeMap.keys()])
    
    return Array.from(allPeriods).sort().map(period => ({
      period,
      expense: expenseMap.get(period) || 0,
      income: incomeMap.get(period) || 0
    }))
  }

  // Format income vs expense data for chart
  const formatIncomeVsExpenseData = () => {
    if (!incomeVsExpense) return []
    return incomeVsExpense.comparison.map(item => ({
      month: item.month,
      Income: item.income,
      Expense: item.expense,
      Savings: item.savings
    }))
  }

  // Format year comparison data
  const formatYearComparisonData = () => {
    if (!yearComparison) return []
    return yearComparison.comparison.map(item => ({
      month: item.month,
      [`${yearComparison.currentYear} Expense`]: item.currentYear.expense,
      [`${yearComparison.previousYear} Expense`]: item.previousYear.expense,
      [`${yearComparison.currentYear} Income`]: item.currentYear.income,
      [`${yearComparison.previousYear} Income`]: item.previousYear.income
    }))
  }

  return (
    <DashboardLayout activeMenu="Analytics">
      <div className='my-5 mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Advanced Analytics</h2>
          
          <div className='flex gap-4'>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            
            <select 
              value={months} 
              onChange={(e) => setMonths(e.target.value)}
              className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
            </select>
          </div>
        </div>

        {/* Savings Rate Card */}
        {savingsRate && (
          <div className='card mb-6 bg-gradient-to-r from-green-500 to-green-600 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg opacity-90'>Savings Rate</h3>
                <p className='text-4xl font-bold mt-2'>{savingsRate.savingsRate}%</p>
                <p className='text-sm opacity-90 mt-1'>{savingsRate.period}</p>
              </div>
              <LuWallet className='text-6xl opacity-30' />
            </div>
            <div className='grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20'>
              <div>
                <p className='text-sm opacity-90'>Income</p>
                <p className='text-lg font-semibold'>${addThousandsSeparator(savingsRate.income)}</p>
              </div>
              <div>
                <p className='text-sm opacity-90'>Expense</p>
                <p className='text-lg font-semibold'>${addThousandsSeparator(savingsRate.expense)}</p>
              </div>
              <div>
                <p className='text-sm opacity-90'>Savings</p>
                <p className='text-lg font-semibold'>${addThousandsSeparator(savingsRate.savings)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ML Expense Prediction */}
        <div className='mb-6'>
          <PredictionChart />
        </div>

        {/* Advanced Analytics Section */}
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>📊 Advanced Analytics</h2>
          
          {/* Cumulative Savings Growth */}
          <div className='mb-6'>
            <CumulativeSavingsGrowth months={months} />
          </div>

          {/* Cash Flow Sankey */}
          <div className='mb-6'>
            <CashFlowSankey months={1} />
          </div>

          {/* Expense Heatmap Calendar */}
          <div className='mb-6'>
            <ExpenseHeatmapCalendar months={3} />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Spending Trends Chart */}
          <div className='card'>
            <div className='flex items-center gap-2 mb-4'>
              <LuTrendingUp className='text-xl text-primary' />
              <h3 className='text-lg font-semibold'>Spending Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatSpendingTrendsData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                  tickFormatter={(value) => `$${addThousandsSeparator(value)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value) => `$${addThousandsSeparator(value)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Expense"
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className='card'>
            <div className='flex items-center gap-2 mb-4'>
              <LuCircle className='text-xl text-primary' />
              <h3 className='text-lg font-semibold'>Category Breakdown</h3>
            </div>
            {categoryBreakdown && categoryBreakdown.breakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
                        const RADIAN = Math.PI / 180
                        const radius = outerRadius + 25
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)
                        
                        // Only show label if percentage is > 3% to avoid clutter
                        if (percentage < 3) return null
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#374151" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            fontSize="11px"
                            fontWeight="600"
                          >
                            {`${percentage}%`}
                          </text>
                        )
                      }}
                      outerRadius={85}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryBreakdown.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `$${addThousandsSeparator(value)}`,
                        props.payload.category
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className='mt-4 max-h-40 overflow-y-auto'>
                  {categoryBreakdown.breakdown.map((cat, index) => (
                    <div key={index} className='flex items-center justify-between py-2 border-b last:border-b-0'>
                      <div className='flex items-center gap-2'>
                        <div 
                          className='w-4 h-4 rounded' 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className='text-sm'>{cat.category}</span>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-semibold'>${addThousandsSeparator(cat.total)}</p>
                        <p className='text-xs text-gray-500'>{cat.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className='text-center text-gray-500 py-8'>No expense data available</p>
            )}
          </div>

          {/* Income vs Expense */}
          <div className='card lg:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <LuActivity className='text-xl text-primary' />
              <h3 className='text-lg font-semibold'>Income vs Expense by Month</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatIncomeVsExpenseData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                  tickFormatter={(value) => `$${addThousandsSeparator(value)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value) => `$${addThousandsSeparator(value)}`}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Savings" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Year-over-Year Comparison */}
          {yearComparison && (
            <div className='card lg:col-span-2'>
              <h3 className='text-lg font-semibold mb-4'>
                Year-over-Year Comparison ({yearComparison.previousYear} vs {yearComparison.currentYear})
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={formatYearComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={`${yearComparison.currentYear} Income`} fill="#4ECDC4" />
                  <Bar dataKey={`${yearComparison.previousYear} Income`} fill="#98D8C8" />
                  <Bar dataKey={`${yearComparison.currentYear} Expense`} fill="#FF6B6B" />
                  <Bar dataKey={`${yearComparison.previousYear} Expense`} fill="#FFA07A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Analytics
