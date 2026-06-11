import React, { useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuUpload, LuX, LuCheck, LuRefreshCw, LuScan, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import toast from 'react-hot-toast'

const ReceiptUpload = ({ onDataExtracted, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [extractedItems, setExtractedItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [editingData, setEditingData] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, BMP, WEBP)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append('receipt', selectedFile)

      const response = await axiosInstance.post(API_PATHS.EXPENSE.UPLOAD_RECEIPT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        const data = response.data.data
        
        // Check if multiple items or single item
        if (data.items && Array.isArray(data.items)) {
          setExtractedItems(data.items)
          setCurrentIndex(0)
          // Initialize editing data with first item
          setEditingData(data.items[0] ? { ...data.items[0] } : null)
          toast.success(`Extracted ${data.items.length} expense(s)!`)
        } else {
          // Backward compatibility - wrap single item in array
          setExtractedItems([data])
          setCurrentIndex(0)
          setEditingData({ ...data })
          toast.success('Receipt processed successfully!')
        }
      } else {
        toast.error(response.data.message || 'Failed to process receipt')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Error uploading receipt')
    } finally {
      setProcessing(false)
    }
  }

  const handleUseData = () => {
    if (editingData) {
      onDataExtracted(editingData)
      // Don't close modal - allow user to add next item
      toast.success('Data applied to form!')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setExtractedItems([])
    setCurrentIndex(0)
    setEditingData(null)
  }
  
  const handleNext = () => {
    if (currentIndex < extractedItems.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setEditingData({ ...extractedItems[nextIndex] })
    }
  }
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setEditingData({ ...extractedItems[prevIndex] })
    }
  }
  
  const handleFieldChange = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 p-4' style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className='rounded-lg shadow-2xl shadow-black/40 max-w-4xl w-full max-h-[90vh] overflow-y-auto' style={{ backgroundColor: '#1A2332', border: '1px solid rgba(148,163,184,0.12)' }}>
        {/* Header */}
        <div className='flex items-center justify-between p-6' style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
          <div className='flex items-center gap-3'>
            <LuScan className='text-2xl' style={{ color: '#8B5CF6' }} />
            <div>
              <h2 className='text-xl font-bold' style={{ color: '#F1F5F9' }}>Upload Receipt</h2>
              <p className='text-sm' style={{ color: '#94A3B8' }}>Automatically extract expense details from your receipt</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 rounded-lg transition-colors' style={{ color: '#64748B' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F1F5F9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}>
            <LuX />
          </button>
        </div>

        <div className='p-6'>
          {/* Upload Area */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-primary' : 'border-gray-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <LuUpload className='mx-auto text-5xl mb-4' style={{ color: '#64748B' }} />
              <p className='text-lg font-semibold mb-2' style={{ color: '#F1F5F9' }}>
                Drop your receipt image here
              </p>
              <p className='text-sm mb-4' style={{ color: '#94A3B8' }}>
                or click to browse (JPG, PNG, GIF, BMP, WEBP - Max 10MB)
              </p>
              <label className='inline-block'>
                <input
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={handleFileSelect}
                />
                <span className='px-6 py-3 text-white rounded-lg cursor-pointer inline-block' style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
                  Choose File
                </span>
              </label>
            </div>
          )}

          {/* Preview and Results */}
          {selectedFile && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Image Preview */}
              <div>
                <h3 className='font-semibold mb-3' style={{ color: '#F1F5F9' }}>Receipt Image</h3>
                <div className='rounded-lg p-4' style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
                  <img
                    src={previewUrl}
                    alt='Receipt preview'
                    className='w-full h-auto max-h-96 object-contain rounded'
                  />
                  <div className='mt-4 flex gap-2'>
                    <button
                      onClick={handleReset}
                      className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                    >
                      Change Image
                    </button>
                    {extractedItems.length === 0 && (
                      <button
                        onClick={handleUpload}
                        disabled={processing}
                        className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2'
                      >
                        {processing ? (
                          <>
                            <LuRefreshCw className='animate-spin' />
                            Processing...
                          </>
                        ) : (
                          <>
                            <LuScan />
                            Scan Receipt
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted Data */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>Extracted Data</h3>
                {processing && (
                  <div className='border rounded-lg p-8 text-center'>
                    <LuRefreshCw className='mx-auto text-4xl text-indigo-600 animate-spin mb-4' />
                    <p className='text-gray-600'>Processing receipt with OCR...</p>
                    <p className='text-sm text-gray-500 mt-2'>This may take a few seconds</p>
                  </div>
                )}

                {!processing && extractedItems.length === 0 && (
                  <div className='border rounded-lg p-8 text-center text-gray-500'>
                    <LuScan className='mx-auto text-4xl text-gray-400 mb-4' />
                    <p>Click "Scan Receipt" to extract data</p>
                  </div>
                )}

                {editingData && extractedItems.length > 0 && (
                  <div className='border rounded-lg p-4 bg-green-50 border-green-200'>
                    {/* Header with navigation */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <LuCheck className='text-green-600' />
                        <span className='font-semibold text-green-900'>
                          Expense {currentIndex + 1} of {extractedItems.length}
                        </span>
                        {editingData.confidence && (
                          <span className='text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full'>
                            {editingData.confidence}% confidence
                          </span>
                        )}
                      </div>
                      
                      {/* Navigation buttons */}
                      {extractedItems.length > 1 && (
                        <div className='flex gap-2'>
                          <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className='p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                            title='Previous expense'
                          >
                            <LuChevronLeft />
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={currentIndex === extractedItems.length - 1}
                            className='p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed'
                            title='Next expense'
                          >
                            <LuChevronRight />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Editable fields */}
                    <div className='space-y-3'>
                      <div>
                        <label className='text-xs font-semibold text-gray-700 block mb-1'>
                          Amount *
                        </label>
                        <input
                          type='number'
                          step='0.01'
                          value={editingData.amount || ''}
                          onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                          placeholder='0.00'
                        />
                      </div>

                      <div>
                        <label className='text-xs font-semibold text-gray-700 block mb-1'>
                          Description
                        </label>
                        <input
                          type='text'
                          value={editingData.description || editingData.merchant || ''}
                          onChange={(e) => handleFieldChange('description', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                          placeholder='e.g., Business Dinner, Taxi Fare'
                        />
                      </div>

                      <div>
                        <label className='text-xs font-semibold text-gray-700 block mb-1'>
                          Date
                        </label>
                        <input
                          type='date'
                          value={editingData.date || ''}
                          onChange={(e) => handleFieldChange('date', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                        />
                      </div>

                      <div>
                        <label className='text-xs font-semibold text-gray-700 block mb-1'>
                          Category
                        </label>
                        <input
                          type='text'
                          value={editingData.category || ''}
                          onChange={(e) => handleFieldChange('category', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                          placeholder='e.g., Food & Dining, Transportation'
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className='mt-6 flex gap-2'>
                      <button
                        onClick={handleUseData}
                        className='flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold'
                      >
                        <LuCheck />
                        ➕ Add to Queue
                      </button>
                      <button
                        onClick={handleReset}
                        className='px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                      >
                        Try Another
                      </button>
                    </div>
                    
                    {extractedItems.length > 1 && (
                      <p className='mt-3 text-xs text-center text-gray-600'>
                        💡 Navigate through expenses and add each to queue, then submit all at once!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='font-semibold text-blue-900 mb-2'>💡 Tips for best results:</p>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• Take photos in good lighting</li>
              <li>• Ensure text is clear and readable</li>
              <li>• Include the total amount in the image</li>
              <li>• Avoid blurry or skewed images</li>
              <li>• Review and edit extracted data before saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptUpload
