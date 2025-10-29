import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import CurrencySelector from '../../components/Currency/CurrencySelector'
import { LuSettings, LuDollarSign, LuUser } from 'react-icons/lu'

const Settings = () => {
  useUserAuth()

  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO)
      if (response.data && response.data.user) {
        setUserInfo(response.data.user)
        setSelectedCurrency(response.data.user.currency || 'USD')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      toast.error('Failed to load user information')
    }
  }

  const handleUpdateCurrency = async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await axiosInstance.put(
        API_PATHS.CURRENCY.UPDATE_PREFERENCE,
        { currency: selectedCurrency }
      )
      
      toast.success('Currency preference updated successfully!')
      setUserInfo(response.data.user)
    } catch (error) {
      console.error('Error updating currency:', error)
      toast.error('Failed to update currency preference')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout activeMenu="Settings">
      <div className='my-5 mx-auto max-w-4xl'>
        <div className='flex items-center gap-3 mb-6'>
          <LuSettings className='text-3xl text-primary' />
          <h2 className='text-2xl font-bold'>Settings</h2>
        </div>

        {/* User Profile Card */}
        {userInfo && (
          <div className='card mb-6'>
            <div className='flex items-center gap-3 mb-4'>
              <LuUser className='text-xl text-primary' />
              <h3 className='text-lg font-semibold'>Profile Information</h3>
            </div>
            <div className='space-y-3'>
              <div>
                <label className='text-sm text-gray-600'>Full Name</label>
                <p className='text-base font-medium'>{userInfo.fullname}</p>
              </div>
              <div>
                <label className='text-sm text-gray-600'>Email</label>
                <p className='text-base font-medium'>{userInfo.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Currency Preferences Card */}
        <div className='card'>
          <div className='flex items-center gap-3 mb-6'>
            <LuDollarSign className='text-xl text-primary' />
            <h3 className='text-lg font-semibold'>Currency Preferences</h3>
          </div>

          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-sm text-blue-800'>
                <strong>Note:</strong> Changing your preferred currency will affect how all amounts are displayed 
                throughout the application. Your existing transactions will be converted to the new currency using 
                current exchange rates.
              </p>
            </div>

            <CurrencySelector
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              label="Preferred Currency"
              required
            />

            <div className='flex justify-end'>
              <button
                onClick={handleUpdateCurrency}
                disabled={loading || selectedCurrency === userInfo?.currency}
                className='btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Updating...' : 'Update Currency Preference'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Settings Sections (Future) */}
        <div className='card mt-6'>
          <h3 className='text-lg font-semibold mb-4'>Additional Settings</h3>
          <div className='space-y-4 text-gray-500'>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium text-gray-700 mb-2'>Notifications</h4>
              <p className='text-sm'>Email notifications for budget alerts (Coming Soon)</p>
            </div>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium text-gray-700 mb-2'>Data Export</h4>
              <p className='text-sm'>Export all your data as CSV or JSON (Coming Soon)</p>
            </div>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-medium text-gray-700 mb-2'>Account Security</h4>
              <p className='text-sm'>Two-factor authentication and password change (Coming Soon)</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
