import React from 'react'
import expenseImage from '../../assets/images/expenseImage2.jpg'
import { LuTrendingUpDown } from 'react-icons/lu'
const AuthLayout = ({ children }) => {
    return (
        <div className='bg-dark-navy flex min-h-screen'>
            <div className='w-full h-screen md:w-[50vw] lg:w-[40vw] px-12 pt-8 pb-12 flex flex-col relative z-20' style={{ backgroundColor: '#1A2332', borderRight: '1px solid rgba(148,163,184,0.08)' }}>
                <h2 className='text-xl font-bold tracking-tight' style={{ color: '#F1F5F9' }}>
                    Expense<span className='text-primary'>Tracker</span>
                </h2>
                {children}
            </div>

            <div className='hidden md:flex flex-1 h-screen overflow-hidden p-8 relative items-center justify-center' style={{ backgroundColor: '#0B1121' }}>
                {/* Decorative gradient orbs */}
                <div className='w-[500px] h-[500px] rounded-full absolute -top-20 -left-20 blur-3xl' style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }}></div>
                <div className='w-[400px] h-[400px] rounded-full absolute -bottom-20 -right-20 blur-3xl' style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)' }}></div>
                <div className='w-[300px] h-[300px] rounded-full absolute top-[40%] left-[30%] blur-3xl' style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)' }}></div>

                <div className='w-48 h-56 rounded-[40px] absolute top-[20%] right-[10%] backdrop-blur-sm' style={{ border: '16px solid rgba(139,92,246,0.12)' }}></div>
                <div className='w-32 h-32 rounded-full absolute bottom-[20%] left-[15%] backdrop-blur-sm' style={{ background: 'rgba(139,92,246,0.1)' }}></div>

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
        <div className='flex items-center gap-5 p-5 rounded-2xl backdrop-blur-xl shadow-xl shadow-black/20' style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className='flex w-12 h-12 items-center justify-center text-white rounded-xl' style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>{icon}</div>
            <div className='text-left'>
                <h6 className='text-[13px] text-text-secondary font-medium mb-0.5'>{label}</h6>
                <span className='text-2xl font-bold text-text-primary tracking-tight'>${value}</span>
            </div>
        </div>
    )
}