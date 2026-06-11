import React from 'react'
import { motion } from 'framer-motion'

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <motion.div
      className='flex gap-6 p-6 rounded-xl transition-all duration-300'
      style={{ backgroundColor: '#1A2332', border: '1px solid rgba(148,163,184,0.08)' }}
      whileHover={{ y: -3, borderColor: 'rgba(148,163,184,0.2)' }}
    >
      <div
        className={`w-14 h-14 flex items-center justify-center text-[26px] text-white rounded-xl`}
        style={{ background: color || 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
      >
        {icon}
      </div>
      <div>
        <h6 className='text-sm font-medium mb-1' style={{ color: '#94A3B8' }}>{label}</h6>
        <span className='text-[24px] font-bold tracking-tight' style={{ color: '#F1F5F9' }}>${value}</span>
      </div>
    </motion.div>
  )
}

export default InfoCard
