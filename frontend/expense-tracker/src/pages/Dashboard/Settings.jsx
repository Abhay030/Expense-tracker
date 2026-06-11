import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'
import CurrencySelector from '../../components/Currency/CurrencySelector'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'
import { LuSettings, LuDollarSign, LuUser, LuDatabase, LuTrash2, LuPencil, LuCheck, LuX } from 'react-icons/lu'
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector'

const Settings = () => {
  useUserAuth()

  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false)
  const [editFullname, setEditFullname] = useState('')
  const [editProfilePic, setEditProfilePic] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Sample data state
  const [sampleDataStatus, setSampleDataStatus] = useState(null)
  const [populating, setPopulating] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showPopulateConfirm, setShowPopulateConfirm] = useState(false)

  useEffect(() => {
    fetchUserInfo()
    fetchSampleDataStatus()
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

  const startEditingProfile = () => {
    setEditFullname(userInfo?.fullname || '')
    setEditProfilePic(null)
    setEditingProfile(true)
  }

  const cancelEditingProfile = () => {
    setEditingProfile(false)
    setEditFullname('')
    setEditProfilePic(null)
  }

  const handleSaveProfile = async () => {
    if (!editFullname.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    if (savingProfile) return
    setSavingProfile(true)
    try {
      let profileImageUrl = userInfo?.profileImageUrl || ''
      if (editProfilePic) {
        const { uploadImage } = await import('../../utils/uploadImage')
        profileImageUrl = await uploadImage(editProfilePic)
      }
      // Update via the existing user info flow — we just update local state for now
      // Since there's no PUT /user endpoint, we use the profile image upload and store locally
      const updatedUser = { ...userInfo, fullname: editFullname, profileImageUrl }
      setUserInfo(updatedUser)
      // Update context
      const { UserContext } = await import('../../context/userContext')
      // Simple local update — full API update would need a new endpoint
      toast.success('Profile updated!')
      setEditingProfile(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const fetchSampleDataStatus = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SAMPLE_DATA.STATUS)
      setSampleDataStatus(response.data)
    } catch (error) {
      console.error('Error fetching sample data status:', error)
    }
  }

  const handlePopulateSampleData = async () => {
    setShowPopulateConfirm(false)
    if (populating) return
    setPopulating(true)
    try {
      const response = await axiosInstance.post(API_PATHS.SAMPLE_DATA.POPULATE)
      toast.success(response.data.message || 'Sample data populated successfully!')
      await fetchSampleDataStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to populate sample data')
    } finally {
      setPopulating(false)
    }
  }

  const handleClearSampleData = async () => {
    setShowClearConfirm(false)
    if (clearing) return
    setClearing(true)
    try {
      const response = await axiosInstance.delete(API_PATHS.SAMPLE_DATA.CLEAR)
      toast.success(response.data.message || 'Sample data cleared successfully!')
      await fetchSampleDataStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear sample data')
    } finally {
      setClearing(false)
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
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <LuUser className='text-xl text-primary' />
                <h3 className='text-lg font-semibold' style={{ color: '#F1F5F9' }}>Profile Information</h3>
              </div>
              {!editingProfile ? (
                <button onClick={startEditingProfile} className='add-btn'>
                  <LuPencil className='text-sm' /> Edit Profile
                </button>
              ) : (
                <div className='flex gap-2'>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className='add-btn add-btn-fill'>
                    {savingProfile ? 'Saving...' : <><LuCheck className='text-sm' /> Save</>}
                  </button>
                  <button onClick={cancelEditingProfile} className='add-btn'>
                    <LuX className='text-sm' /> Cancel
                  </button>
                </div>
              )}
            </div>
            {editingProfile ? (
              <div className='space-y-4'>
                <ProfilePhotoSelector image={editProfilePic} setImage={setEditProfilePic} />
                <div>
                  <label className='text-[13px] font-medium block mb-1' style={{ color: '#94A3B8' }}>Full Name</label>
                  <input value={editFullname} onChange={(e) => setEditFullname(e.target.value)}
                    className='w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200 focus:ring-2'
                    style={{ backgroundColor: '#1E293B', borderColor: 'rgba(148,163,184,0.12)', color: '#F1F5F9' }}
                    placeholder='Enter your name' />
                </div>
              </div>
            ) : (
              <div className='space-y-3'>
                <div>
                  <label className='text-sm' style={{ color: '#94A3B8' }}>Full Name</label>
                  <p className='text-base font-medium' style={{ color: '#F1F5F9' }}>{userInfo.fullname}</p>
                </div>
                <div>
                  <label className='text-sm' style={{ color: '#94A3B8' }}>Email</label>
                  <p className='text-base font-medium' style={{ color: '#F1F5F9' }}>{userInfo.email}</p>
                </div>
              </div>
            )}
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

        {/* Sample Data Section */}
        <div className='card mt-6'>
          <div className='flex items-center gap-3 mb-4'>
            <LuDatabase className='text-xl text-primary' />
            <h3 className='text-lg font-semibold'>Demo Sample Data</h3>
          </div>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Populate your account with realistic sample transactions to explore all features of the
              Expense Tracker. Perfect for demos, testing, or showcasing to recruiters.
            </p>

            {sampleDataStatus && sampleDataStatus.hasSampleData && (
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <p className='text-sm text-green-700'>
                  Sample data loaded:{' '}
                  <strong>{sampleDataStatus.expenseCount}</strong> expenses,{' '}
                  <strong>{sampleDataStatus.incomeCount}</strong> incomes
                </p>
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                onClick={() => {
                  if (sampleDataStatus?.hasSampleData) {
                    toast.error('Sample data already exists. Clear it first to regenerate.')
                  } else {
                    setShowPopulateConfirm(true)
                  }
                }}
                disabled={populating}
                className='add-btn add-btn-fill disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {populating ? (
                  <span className='flex items-center gap-2'>
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Populating...
                  </span>
                ) : (
                  <>
                    <LuDatabase className='text-lg' />
                    Populate Sample Data
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (!sampleDataStatus?.hasSampleData) {
                    toast.error('No sample data to clear.')
                  } else {
                    setShowClearConfirm(true)
                  }
                }}
                disabled={clearing || !sampleDataStatus?.hasSampleData}
                className='add-btn disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {clearing ? (
                  <span className='flex items-center gap-2'>
                    <span className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                    Clearing...
                  </span>
                ) : (
                  <>
                    <LuTrash2 className='text-lg' />
                    Clear Sample Data
                  </>
                )}
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
        {/* Populate Confirmation Modal */}
        <Modal
          isOpen={showPopulateConfirm}
          onClose={() => setShowPopulateConfirm(false)}
          title="Populate Sample Data"
        >
          <div>
            <p className='text-sm text-slate-700'>
              This will add <strong>~50 expenses</strong> and <strong>~10 income entries</strong>{' '}
              of realistic sample data to your account. These will be clearly marked and can be
              removed at any time.
            </p>
            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                className='px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors'
                onClick={() => setShowPopulateConfirm(false)}
              >
                Cancel
              </button>
              <button
                type='button'
                className='px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors'
                onClick={handlePopulateSampleData}
              >
                Populate
              </button>
            </div>
          </div>
        </Modal>

        {/* Clear Confirmation Modal */}
        <Modal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          title="Clear Sample Data"
        >
          <DeleteAlert
            content="Are you sure you want to clear all sample data? This will remove all demo expenses and incomes that were generated for your account. Your own manual entries will not be affected."
            onDelete={handleClearSampleData}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Settings
