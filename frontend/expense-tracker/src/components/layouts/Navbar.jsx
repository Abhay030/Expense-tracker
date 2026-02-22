import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import SideMenu from './SideMenu';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);

    return (
        <div className='flex justify-center bg-white border-b border-slate-200/60 py-4 px-7 sticky top-0 z-30'>
            <div className='w-full flex items-center gap-5'>
                <button className='block lg:hidden text-slate-700 hover:text-primary transition-colors' onClick={() => { setOpenSideMenu(!openSideMenu) }}>
                    {openSideMenu ? (<HiOutlineX className='text-2xl' />) : (<HiOutlineMenu className='text-2xl' />)}
                </button>
                <h2 className='text-lg font-bold text-slate-800 tracking-tight'>Expense<span className='text-primary'>Tracker</span></h2>
            </div>

            {openSideMenu && (
                <div className='fixed top-[61px] left-0 w-64 bg-white shadow-xl h-[calc(100vh-61px)]'>
                    <SideMenu activeMenu={activeMenu} />
                </div>
            )}
        </div>
    )
}

export default Navbar