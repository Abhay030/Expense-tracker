import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlayVariants, modalContentVariants } from '../utils/animations';

const Modal = ({ children, isOpen, onClose, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex justify-center items-center overflow-y-auto overflow-x-hidden'
          style={{ background: 'rgba(0,0,0,0.6)' }}
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="relative p-4 w-full max-w-lg max-h-full"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl shadow-2xl shadow-black/40" style={{ backgroundColor: '#1A2332', border: '1px solid rgba(148,163,184,0.12)' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                <h3 className="text-[17px] font-semibold tracking-tight" style={{ color: '#F1F5F9' }}>{title}</h3>
                <button
                  type="button"
                  className="rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-colors"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F1F5F9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                  onClick={onClose}
                >
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>
              {/* Body */}
              <div className="p-5 space-y-4">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
