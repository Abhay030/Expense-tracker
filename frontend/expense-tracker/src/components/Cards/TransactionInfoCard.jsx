import React from 'react'
import { motion } from 'framer-motion'
import { LuUtensils, LuTrendingUp, LuTrendingDown, LuTrash2 } from 'react-icons/lu'

const TransactionInfoCard = ({ title, icon, date, amount, type, hideDeleteBtn, onDelete }) => {
    const getAmountStyles = () =>
        type === 'income'
            ? { background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }
            : { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }

    return (
        <motion.div
            className='group relative flex items-center gap-4 mt-2 p-3 rounded-xl transition-colors'
            style={{ border: '1px solid transparent' }}
            whileHover={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(148,163,184,0.08)' }}
        >
            <div className='w-12 h-12 flex items-center justify-center text-xl rounded-full shadow-sm'
                style={{ color: '#F1F5F9', backgroundColor: '#1E293B' }}>
                {icon ? (<img src={icon} alt={title} className='w-6 h-6' />) : (<LuUtensils />)}
            </div>

            <div className='flex-1 flex items-center justify-between'>
                <div>
                    <p className='text-[15px] font-medium' style={{ color: '#F1F5F9' }}>{title}</p>
                    <p className='text-xs mt-1' style={{ color: '#64748B' }}>{date}</p>
                </div>
                <div className='flex items-center gap-2'>
                    {!hideDeleteBtn && (
                        <button className='opacity-0 group-hover:opacity-100 transition-all cursor-pointer'
                            style={{ color: '#64748B' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                            onClick={onDelete}>
                            <LuTrash2 size={18} />
                        </button>
                    )}
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm' style={getAmountStyles()}>
                    <h6 className='text-sm font-medium'>
                        {type === 'income' ? '+' : '-'} ${amount}
                    </h6>
                    {type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}
                </div>
            </div>
        </motion.div>
    )
}

export default TransactionInfoCard
