import React from 'react';

const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center bg-slate-900/20 backdrop-blur-sm overflow-y-auto overflow-x-hidden'>
      <div className="relative p-4 w-full max-w-lg max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/60">

          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200/60">
            <h3 className="text-[17px] font-semibold text-slate-800 tracking-tight">{title}</h3>
            <button
              type="button"
              className="text-slate-400 bg-transparent hover:bg-slate-100 hover:text-slate-800 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1l12 12M13 1L1 13"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
