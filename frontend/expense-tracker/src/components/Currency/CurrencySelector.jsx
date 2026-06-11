import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'

const CurrencySelector = ({ value, onChange, label = "Currency", required = false }) => {
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupportedCurrencies()
  }, [])

  const fetchSupportedCurrencies = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.CURRENCY.SUPPORTED)
      setCurrencies(response.data.currencies || [])
    } catch (error) {
      console.error('Error fetching currencies:', error)
      // Fallback currencies
      setCurrencies([
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='input-group'>
        <label className='input-label'>{label}</label>
        <div className='px-4 py-2 border rounded-lg' style={{ backgroundColor: '#1E293B', borderColor: 'rgba(148,163,184,0.12)', color: '#94A3B8' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className='input-group'>
      <label className='input-label'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary' style={{ backgroundColor: '#1E293B', borderColor: 'rgba(148,163,184,0.12)', color: '#F1F5F9' }}
      >
        <option value="">Select Currency</option>
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} - {currency.code} ({currency.name})
          </option>
        ))}
      </select>
    </div>
  )
}

export default CurrencySelector
