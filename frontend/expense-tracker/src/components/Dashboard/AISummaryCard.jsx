import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuSparkles, LuRefreshCw, LuTrendingUp, LuTrendingDown, LuMinus } from 'react-icons/lu'
import { addThousandsSeparator } from '../../utils/helper'

const AISummaryCard = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAISummary()
  }, [])

  const fetchAISummary = async () => {
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.AI_SUMMARY)
      
      if (response.data.success) {
        setSummary(response.data)
      } else {
        setError('Unable to generate summary')
      }
    } catch (err) {
      console.error('Error fetching AI summary:', err)
      setError('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (insights) => {
    if (!insights) return null
    
    switch(insights.trend) {
      case 'improving':
        return <LuTrendingUp className='text-green-500' />
      case 'concerning':
        return <LuTrendingDown className='text-red-500' />
      default:
        return <LuMinus className='text-gray-500' />
    }
  }

  const getTrendColor = (insights) => {
    if (!insights) return 'bg-gray-50 border-gray-200'
    
    switch(insights.trend) {
      case 'improving':
        return 'bg-green-50 border-green-200'
      case 'concerning':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <LuSparkles className='text-2xl text-purple-600 animate-spin' />
          <h3 className='text-lg font-semibold'>AI Financial Insights</h3>
        </div>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='card bg-red-50 border border-red-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <LuSparkles className='text-2xl text-red-600' />
            <div>
              <h3 className='text-lg font-semibold text-red-900'>AI Insights Unavailable</h3>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAISummary}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2'
          >
            <LuRefreshCw className='text-sm' />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!summary || !summary.summary) {
    return null
  }

  const { summary: aiSummary, data } = summary
  const { insights } = data || {}

  return (
    <div className={`card border-2 ${getTrendColor(insights)}`}>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <LuSparkles className='text-2xl text-purple-600' />
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>AI Financial Insights</h3>
            <p className='text-xs text-gray-500'>
              Powered by OpenAI • {new Date(aiSummary.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAISummary}
          disabled={loading}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          title='Refresh insights'
        >
          <LuRefreshCw className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Summary Text */}
      <div className='mb-4 p-4 bg-white rounded-lg border border-gray-200'>
        <p className='text-base text-gray-800 leading-relaxed'>
          {aiSummary.text}
        </p>
      </div>

      {/* Key Metrics */}
      {insights && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {/* Expense Change */}
          {Math.abs(insights.expenseChangePercent) > 1 && (
            <div className='p-3 bg-white rounded-lg border border-gray-200'>
              <p className='text-xs text-gray-600 mb-1'>Expense Change</p>
              <div className='flex items-center gap-2'>
                {insights.expenseChange > 0 ? (
                  <LuTrendingUp className='text-red-500' />
                ) : (
                  <LuTrendingDown className='text-green-500' />
                )}
                <span className={`text-lg font-bold ${
                  insights.expenseChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {insights.expenseChange > 0 ? '+' : ''}{insights.expenseChangePercent}%
                </span>
              </div>
            </div>
          )}

          {/* Top Category */}
          {insights.topSpendingCategory && (
            <div className='p-3 bg-white rounded-lg border border-gray-200'>
              <p className='text-xs text-gray-600 mb-1'>Top Category</p>
              <p className='text-sm font-bold text-gray-900 truncate'>
                {insights.topSpendingCategory.category}
              </p>
              <p className='text-xs text-gray-500'>
                ${addThousandsSeparator(insights.topSpendingCategory.amount.toFixed(0))}
              </p>
            </div>
          )}

          {/* Savings Change */}
          {insights.savingsChange !== 0 && (
            <div className='p-3 bg-white rounded-lg border border-gray-200'>
              <p className='text-xs text-gray-600 mb-1'>Savings</p>
              <div className='flex items-center gap-2'>
                {insights.savingsChange > 0 ? (
                  <LuTrendingUp className='text-green-500' />
                ) : (
                  <LuTrendingDown className='text-red-500' />
                )}
                <span className={`text-lg font-bold ${
                  insights.savingsChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insights.savingsChange > 0 ? '+' : ''}${addThousandsSeparator(Math.abs(insights.savingsChange).toFixed(0))}
                </span>
              </div>
            </div>
          )}

          {/* Overall Trend */}
          <div className='p-3 bg-white rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 mb-1'>Trend</p>
            <div className='flex items-center gap-2'>
              {getTrendIcon(insights)}
              <span className='text-sm font-bold text-gray-900 capitalize'>
                {insights.trend}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Source Badge */}
      <div className='mt-4 flex items-center justify-between text-xs'>
        <span className='text-gray-500'>
          {aiSummary.source === 'openai' ? '✨ AI-Powered Analysis' : '📊 Basic Analysis'}
        </span>
        {data?.currentMonth && (
          <span className='text-gray-500'>
            Analyzing {data.currentMonth.month}
          </span>
        )}
      </div>
    </div>
  )
}

export default AISummaryCard
