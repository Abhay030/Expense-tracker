import React from 'react'

const DeleteAlert = ({ content, onDelete }) => {
    return (
        <div>
            <p className='text-[15px]' style={{ color: '#94A3B8' }}>
                {content}
            </p>

            <div className="flex justify-end mt-6">
                <button
                    type='button'
                    className='px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 active:scale-[0.98]'
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default DeleteAlert