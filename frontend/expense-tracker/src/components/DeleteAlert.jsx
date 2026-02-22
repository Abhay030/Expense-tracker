import React from 'react'

const DeleteAlert = ({ content, onDelete }) => {
    return (
        <div>
            <p className='text-[15px] text-slate-700'>
                {content}
            </p>

            <div className="flex justify-end mt-6">
                <button
                    type='button'
                    className='px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors active:scale-[0.98]'
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default DeleteAlert