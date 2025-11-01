import React, { useState, useEffect } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuCalendar, LuRefreshCw } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'

const ExpenseHeatmapCalendar = ({ months = 3 }) => {
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchHeatmapData()
  }, [months])

  const fetchHeatmapData = async () => {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (response.data.expenses) {
        processHeatmapData(response.data.expenses)
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processHeatmapData = (expenses) => {
    // Group expenses by date
    const dailyExpenses = {}
    
    expenses.forEach(expense => {
      const date = new Date(expense.date).toDateString()
      if (!dailyExpenses[date]) {
        dailyExpenses[date] = 0
      }
      dailyExpenses[date] += expense.amount
    })

    // Convert to array format
    const data = Object.entries(dailyExpenses).map(([date, amount]) => ({
      date: new Date(date),
      amount: amount
    }))

    setHeatmapData(data)
  }

  const getIntensityColor = (amount) => {
    if (!amount || amount === 0) return 'bg-gray-100'
    
    // Find max amount for scaling
    const maxAmount = Math.max(...heatmapData.map(d => d.amount))
    const intensity = amount / maxAmount

    if (intensity > 0.8) return 'bg-red-600'
    if (intensity > 0.6) return 'bg-red-500'
    if (intensity > 0.4) return 'bg-orange-500'
    if (intensity > 0.2) return 'bg-yellow-500'
    return 'bg-green-400'
  }

  const generateCalendarGrid = () => {
    const today = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const days = []
    const currentDate = new Date(startDate)

    while (currentDate <= today) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const getAmountForDate = (date) => {
    const found = heatmapData.find(d => 
      d.date.toDateString() === date.toDateString()
    )
    return found ? found.amount : 0
  }

  const getDayOfWeek = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  const getMonthLabel = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <LuCalendar className='text-2xl text-indigo-600' />
          <h3 className='text-lg font-semibold'>Expense Heatmap Calendar</h3>
        </div>
        <div className='flex items-center justify-center py-12'>
          <LuRefreshCw className='animate-spin text-3xl text-indigo-600' />
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarGrid()
  const maxAmount = Math.max(...heatmapData.map(d => d.amount), 1)

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <LuCalendar className='text-2xl text-indigo-600' />
          <div>
            <h3 className='text-lg font-semibold'>Expense Heatmap Calendar</h3>
            <p className='text-sm text-gray-600'>Daily spending intensity - Last {months} months</p>
          </div>
        </div>
        <button
          onClick={fetchHeatmapData}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          title='Refresh'
        >
          <LuRefreshCw className='text-xl text-gray-600' />
        </button>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-4 mb-4 text-sm'>
        <span className='text-gray-600'>Less</span>
        <div className='flex gap-1'>
          <div className='w-4 h-4 bg-gray-100 rounded'></div>
          <div className='w-4 h-4 bg-green-400 rounded'></div>
          <div className='w-4 h-4 bg-yellow-500 rounded'></div>
          <div className='w-4 h-4 bg-orange-500 rounded'></div>
          <div className='w-4 h-4 bg-red-500 rounded'></div>
          <div className='w-4 h-4 bg-red-600 rounded'></div>
        </div>
        <span className='text-gray-600'>More</span>
      </div>

      {/* Calendar Grid */}
      <div className='overflow-x-auto'>
        <div className='inline-block min-w-full'>
          {/* Day labels */}
          <div className='flex gap-1 mb-2'>
            <div className='w-12'></div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className='text-xs text-gray-600 w-4 text-center'>
                {day[0]}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className='space-y-1'>
            {(() => {
              const weeks = []
              let currentWeek = []
              let currentMonth = null

              calendarDays.forEach((date, index) => {
                const dayOfWeek = date.getDay()
                
                // Start new week on Monday
                if (dayOfWeek === 1 && currentWeek.length > 0) {
                  weeks.push([...currentWeek])
                  currentWeek = []
                }

                currentWeek.push(date)

                // Last day
                if (index === calendarDays.length - 1) {
                  weeks.push(currentWeek)
                }
              })

              return weeks.map((week, weekIndex) => {
                const monthLabel = getMonthLabel(week[0])
                
                return (
                  <div key={weekIndex} className='flex items-center gap-1'>
                    {/* Month label */}
                    <div className='w-12 text-xs text-gray-600 truncate'>
                      {weekIndex === 0 || getMonthLabel(weeks[weekIndex - 1]?.[0]) !== monthLabel ? monthLabel : ''}
                    </div>

                    {/* Days in week */}
                    <div className='flex gap-1'>
                      {/* Padding for days before Monday */}
                      {weekIndex === 0 && week[0].getDay() !== 1 && 
                        [...Array((week[0].getDay() + 6) % 7)].map((_, i) => (
                          <div key={`pad-${i}`} className='w-4 h-4'></div>
                        ))
                      }
                      
                      {week.map((date, dayIndex) => {
                        const amount = getAmountForDate(date)
                        const intensity = getIntensityColor(amount)
                        const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()

                        return (
                          <div
                            key={dayIndex}
                            className={`w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-110 ${intensity} ${
                              isSelected ? 'ring-2 ring-indigo-600' : ''
                            }`}
                            title={`${date.toDateString()}: $${amount.toFixed(2)}`}
                            onMouseEnter={() => setSelectedDate(date)}
                            onClick={() => setSelectedDate(date)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* Tooltip / Selected Date Info */}
      {selectedDate && (
        <div className='mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className='text-2xl font-bold text-indigo-900 mt-1'>
                ${addThousandsSeparator(getAmountForDate(selectedDate).toFixed(2))}
              </p>
              <p className='text-xs text-gray-600 mt-1'>
                {((getAmountForDate(selectedDate) / maxAmount) * 100).toFixed(0)}% of max daily spending
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${getIntensityColor(getAmountForDate(selectedDate))}`}></div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-4 mt-6'>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-xs text-gray-600 mb-1'>Total Days</p>
          <p className='text-lg font-bold text-gray-900'>{calendarDays.length}</p>
        </div>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-xs text-gray-600 mb-1'>Days with Spending</p>
          <p className='text-lg font-bold text-gray-900'>{heatmapData.length}</p>
        </div>
        <div className='text-center p-3 bg-gray-50 rounded-lg'>
          <p className='text-xs text-gray-600 mb-1'>Max Daily Spend</p>
          <p className='text-lg font-bold text-red-600'>${addThousandsSeparator(maxAmount.toFixed(2))}</p>
        </div>
      </div>
    </div>
  )
}

export default ExpenseHeatmapCalendar
