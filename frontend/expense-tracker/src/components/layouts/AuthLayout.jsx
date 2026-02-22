import React from 'react'
import expenseImage from '../../assets/images/expenseImage2.jpg'
import { LuTrendingUpDown } from 'react-icons/lu'
const AuthLayout = ({ children }) => {
    return (
        <div className='bg-slate-50 flex min-h-screen'>
            <div className='w-full h-screen md:w-[50vw] lg:w-[40vw] px-12 pt-8 pb-12 bg-white flex flex-col relative z-20 shadow-2xl shadow-slate-200/50'>
                <h2 className='text-xl font-bold text-slate-800 tracking-tight'>
                    Expense<span className="text-primary">Tracker</span>
                </h2>
                {children}
            </div>

            <div className='hidden md:flex flex-1 h-screen bg-indigo-50 overflow-hidden p-8 relative items-center justify-center'>
                {/* Decorative Elements */}
                <div className='w-[400px] h-[400px] rounded-full bg-primary/5 absolute -top-20 -left-20 blur-3xl'></div>
                <div className='w-[400px] h-[400px] rounded-full bg-indigo-400/10 absolute -bottom-20 -right-20 blur-3xl'></div>

                <div className='w-48 h-56 rounded-[40px] border-[16px] border-primary/20 absolute top-[20%] right-[10%] backdrop-blur-sm'></div>
                <div className='w-32 h-32 rounded-full bg-indigo-200/50 absolute bottom-[20%] left-[15%] backdrop-blur-sm'></div>

                <div className='relative z-10 flex flex-col items-center max-w-md text-center'>
                    <div className='mb-8'>
                        <StatsInfoCard
                            icon={<LuTrendingUpDown className="text-2xl" />}
                            label="Track your income & expenses"
                            value="430,000"
                        />
                    </div>

                    {expenseImage && (
                        <img src={expenseImage} className='w-full max-w-[320px] rounded-2xl shadow-2xl shadow-indigo-900/10 border border-white/50 object-cover' alt="Dashboard Preview" />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuthLayout

const StatsInfoCard = ({ icon, label, value }) => {
    return (
        <div className='flex items-center gap-5 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xl shadow-indigo-900/5 border border-white'>
            <div className='flex w-12 h-12 items-center justify-center text-white bg-primary rounded-xl shadow-inner'>{icon}</div>
            <div className='text-left'>
                <h6 className='text-[13px] text-slate-500 font-medium mb-0.5'>{label}</h6>
                <span className='text-2xl font-bold text-slate-800 tracking-tight'>${value}</span>
            </div>
        </div>
    )
}