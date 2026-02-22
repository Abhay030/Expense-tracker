import React from 'react'
import { LuUtensils, LuTrendingUp, LuTrendingDown, LuTrash2 } from 'react-icons/lu'

const TransactionInfoCard = ({
    title,
    icon,
    date,
    amount,
    type,
    hideDeleteBtn,
    onDelete
}) => {

    const getAmountStyles = () => type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'


    return <div className='group relative flex items-center gap-4 mt-2 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/50'>
        <div className='w-12 h-12 flex items-center justify-center text-xl text-slate-700 bg-slate-100 rounded-full shadow-sm'>
            {icon ? (
                <img src={icon} alt={title} className='w-6 h-6' />
            ) : (
                <LuUtensils />
            )}
        </div>

        <div className='flex-1 flex items-center justify-between'>
            <div className=''>
                <p className='text-[15px] text-slate-800 font-medium'>{title}</p>
                <p className='text-xs text-slate-500 mt-1'>{date}</p>
            </div>

            <div className='flex items-center gap-2'>
                {!hideDeleteBtn && (
                    <button className='text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer'
                        onClick={onDelete}>
                        <LuTrash2 size={18} />
                    </button>
                )}
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm ${getAmountStyles()}`}>
                <h6 className='text-sm font-medium'>
                    {type === 'income' ? '+' : '-'} ${amount}
                </h6>
                {type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}
            </div>
        </div>
    </div>
};
export default TransactionInfoCard;