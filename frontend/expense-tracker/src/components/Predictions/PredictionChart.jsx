import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import { LuTrendingUp, LuTrendingDown, LuRefreshCw, LuActivity, LuCircle } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'

const PredictionChart = ({ compact = false }) => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPrediction()
  }, [])

  const fetchPrediction = async () => {
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get(API_PATHS.ANALYTICS.PREDICTION)
      
      if (response.data.success) {
        setPrediction(response.data)
      } else {
        setError(response.data.error || 'Unable to generate prediction')
      }
    } catch (err) {
      console.error('Error fetching prediction:', err)
      setError('Failed to load predictions. Add more expense data.')
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = () => {
    if (!prediction) return []
    
    const { historical, forecast_months, prediction: pred } = prediction
    
    // Historical data points
    const historicalData = historical.months.map((month, index) => ({
      month: month.substring(5), // Get MM from YYYY-MM
      actual: historical.values[index],
      predicted: null
    }))
    
    // Forecast data points
    const forecastData = forecast_months.map((month, index) => ({
      month: month.substring(5),
      actual: null,
      predicted: pred.next_3_months[index]
    }))
    
    return [...historicalData, ...forecastData]
  }

  const getInsightIcon = (type) => {
    switch(type) {
      case 'warning':
        return <LuCircle className='text-orange-500' />
      case 'positive':
        return <LuCircle className='text-green-500' />
      default:
        return <LuCircle className='text-blue-500' />
    }
  }

  if (loading) {
    return (
      <div className={compact ? 'card p-4' : 'card'}>
        <div className='flex items-center gap-3 mb-4'>
          <LuActivity className='text-2xl text-indigo-600 animate-pulse' />
          <h3 className={compact ? 'text-base font-semibold' : 'text-lg font-semibold'}>
            Expense Forecast
          </h3>
        </div>
        <div className='animate-pulse space-y-3'>
          <div className='h-32 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='card bg-orange-50 border border-orange-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <LuCircle className='text-2xl text-orange-600' />
            <div>
              <h3 className='text-lg font-semibold text-orange-900'>Prediction Unavailable</h3>
              <p className='text-sm text-orange-700'>{error}</p>
            </div>
          </div>
          <button
            onClick={fetchPrediction}
            className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm'
          >
            <LuRefreshCw />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!prediction) return null

  const chartData = prepareChartData()
  const { prediction: pred, statistics, trend, insights } = prediction

  return (
    <div className='card border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <LuActivity className='text-2xl text-indigo-600' />
          <div>
            <h3 className={compact ? 'text-base font-semibold text-gray-900' : 'text-lg font-semibold text-gray-900'}>
              ML-Powered Expense Forecast
            </h3>
            <p className='text-xs text-gray-500'>
              Next month prediction using {pred.method.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className='p-2 hover:bg-indigo-100 rounded-lg transition-colors'
          title='Refresh prediction'
        >
          <LuRefreshCw className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Prediction Highlight */}
      <div className='mb-6 p-4 bg-indigo-600 text-white rounded-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm opacity-90'>Predicted spending for next month</p>
            <p className='text-3xl font-bold'>${addThousandsSeparator(pred.next_month.toFixed(0))}</p>
            <div className='flex items-center gap-2 mt-2'>
              {pred.next_month > statistics.average ? (
                <>
                  <LuTrendingUp className='text-red-300' />
                  <span className='text-sm'>
                    {(((pred.next_month - statistics.average) / statistics.average) * 100).toFixed(1)}% above average
                  </span>
                </>
              ) : (
                <>
                  <LuTrendingDown className='text-green-300' />
                  <span className='text-sm'>
                    {(((statistics.average - pred.next_month) / statistics.average) * 100).toFixed(1)}% below average
                  </span>
                </>
              )}
            </div>
          </div>
          <div className='text-right'>
            <p className='text-sm opacity-90'>Confidence</p>
            <p className='text-2xl font-bold'>{(pred.confidence * 100).toFixed(0)}%</p>
            <div className='w-16 h-2 bg-indigo-400 rounded-full mt-2 overflow-hidden'>
              <div 
                className='h-full bg-white rounded-full'
                style={{ width: `${pred.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className='mb-6'>
        <ResponsiveContainer width="100%" height={compact ? 180 : 250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => value ? `$${addThousandsSeparator(value.toFixed(0))}` : 'N/A'}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#4F46E5" 
              strokeWidth={3}
              name="Historical Spending"
              dot={{ fill: '#4F46E5', r: 4 }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#F59E0B" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Predicted Spending"
              dot={{ fill: '#F59E0B', r: 4 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Grid */}
      {!compact && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
          <div className='p-3 bg-white rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 mb-1'>Average</p>
            <p className='text-lg font-bold text-gray-900'>
              ${addThousandsSeparator(statistics.average.toFixed(0))}
            </p>
          </div>
          
          <div className='p-3 bg-white rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 mb-1'>Trend</p>
            <p className='text-sm font-bold text-gray-900 capitalize flex items-center gap-2'>
              {trend.trend === 'increasing' && <LuTrendingUp className='text-red-500' />}
              {trend.trend === 'decreasing' && <LuTrendingDown className='text-green-500' />}
              {trend.trend}
            </p>
          </div>
          
          <div className='p-3 bg-white rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 mb-1'>Min/Max</p>
            <p className='text-xs font-bold text-gray-900'>
              ${statistics.min.toFixed(0)} / ${statistics.max.toFixed(0)}
            </p>
          </div>
          
          <div className='p-3 bg-white rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 mb-1'>Volatility</p>
            <p className='text-sm font-bold text-gray-900 capitalize'>
              {trend.volatility}
            </p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && !compact && (
        <div className='space-y-2'>
          <p className='text-sm font-semibold text-gray-700 mb-2'>💡 Insights</p>
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                insight.type === 'warning' ? 'bg-orange-50 border border-orange-200' :
                insight.type === 'positive' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              {getInsightIcon(insight.type)}
              <p className='flex-1 text-gray-800'>{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Method Badge */}
      <div className='mt-4 text-xs text-gray-500 flex items-center justify-between'>
        <span>
          🧠 Powered by {pred.method.includes('linear') ? 'Linear Regression' : 
                        pred.method.includes('polynomial') ? 'Polynomial Regression' : 
                        'Moving Average'} ML
        </span>
        <span>
          {prediction.historical.months.length} months analyzed
        </span>
      </div>
    </div>
  )
}

export default PredictionChart
