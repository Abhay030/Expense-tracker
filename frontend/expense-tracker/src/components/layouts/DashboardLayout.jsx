import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu'
import Navbar from './Navbar'


const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext)
    return (
        <div className='bg-slate-50 min-h-screen'>
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className='flex w-full'>
                    <div className='max-[1080px]:hidden'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>
                    <div className='grow mx-4 md:mx-6 lg:mx-8 pt-6 pb-10'>{children}</div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout