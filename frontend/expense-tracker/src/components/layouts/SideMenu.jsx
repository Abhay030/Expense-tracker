import React from 'react'
import { SIDE_MENU_DATA } from '../../utils/data'
import { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { useNavigate } from 'react-router-dom'
import CharAvatar from '../Cards/CharAvatar'
const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate()

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }

    navigate(route);
  }

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  }

  return <div className='w-64 h-[calc(100vh-61px)] bg-white border-r border-slate-200/60 p-5 sticky top-[61px] z-20'>
    <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-8'>
      {user?.profileImageUrl ? (<img src={user?.profileImageUrl || ""} alt='Profile Image' className='w-20 h-20 object-cover bg-slate-100 rounded-full border border-slate-200/50 shadow-sm' />)
        : (<CharAvatar fullname={user?.fullname} width='w-20' height='h-20' style='text-2xl shadow-sm' />)}

      <h5 className='text-slate-800 font-semibold leading-6'>
        {user?.fullname || ""}
      </h5>
    </div>

    {SIDE_MENU_DATA.map((item, index) => (
      <button
        key={`menu-${index}`}
        className={`w-full flex items-center gap-4 text-[14px] font-medium transition-colors duration-200 ${activeMenu == item.label
            ? "text-white bg-primary shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } py-3 px-5 rounded-lg mb-2`} onClick={() => handleClick(item.path)}>

        <item.icon className='text-lg ' />
        {item.label}
      </button>
    ))}
  </div>
}

export default SideMenu