import React from 'react'

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className='flex gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md'>
      <div className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-xl shadow-sm`}>
        {icon}
      </div>

      <div>
        <h6 className='text-sm text-slate-500 font-medium mb-1'>{label}</h6>
        <span className='text-[24px] font-bold text-slate-800 tracking-tight'>${value}</span>
      </div>
    </div>

  )
}

export default InfoCard