import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import SideMenu from './SideMenu';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);

    return (
        <div className='flex justify-center border-b py-4 px-7 sticky top-0 z-30' style={{ backgroundColor: '#1A2332', borderColor: 'rgba(148,163,184,0.08)' }}>
            <div className='w-full flex items-center gap-5'>
                <button className='block lg:hidden text-text-secondary hover:text-primary transition-colors' onClick={() => { setOpenSideMenu(!openSideMenu) }}>
                    {openSideMenu ? (<HiOutlineX className='text-2xl' />) : (<HiOutlineMenu className='text-2xl' />)}
                </button>
                <h2 className='text-lg font-bold tracking-tight' style={{ color: '#F1F5F9' }}>
                    Expense<span className='text-primary'>Tracker</span>
                </h2>
            </div>

            {openSideMenu && (
                <div className='fixed top-[61px] left-0 w-64 shadow-2xl shadow-black/40 h-[calc(100vh-61px)]' style={{ backgroundColor: '#1A2332' }}>
                    <SideMenu activeMenu={activeMenu} />
                </div>
            )}
        </div>
    )
}

export default Navbar