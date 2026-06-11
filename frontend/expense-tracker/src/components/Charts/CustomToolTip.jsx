import React from 'react'

const CustomToolTip = ({active , payload}) => {
  if(active && payload && payload.length) {
    return (
        <div className='shadow-xl rounded-lg p-3' style={{ backgroundColor: '#1A2332', border: '1px solid rgba(148,163,184,0.12)' }}>
            <p className='text-xs font-semibold mb-1' style={{ color: '#8B5CF6' }}>{payload[0].name}</p>
            <p className='text-sm' style={{ color: '#94A3B8' }}>
                Amount:{" "} <span className='text-sm font-medium' style={{ color: '#F1F5F9' }}>${payload[0].value}</span>
            </p>
        </div>
      )
  }
  return null;
}

export default CustomToolTip