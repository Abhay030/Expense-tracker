import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu'
import Navbar from './Navbar'


const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext)
    return (
        <div className='bg-dark-navy min-h-screen'>
            <Navbar activeMenu={activeMenu} />

            {user ? (
                <div className='flex w-full'>
                    <div className='max-[1080px]:hidden'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>
                    <div className='grow mx-4 md:mx-6 lg:mx-8 pt-6 pb-10'>{children}</div>
                </div>
            ) : (
                <div className='flex items-center justify-center min-h-[60vh]'>
                    <div className='flex flex-col items-center gap-4'>
                        <div className='w-10 h-10 rounded-full animate-spin' style={{ border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6' }}></div>
                        <p className='text-text-muted text-sm'>Loading your dashboard...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout