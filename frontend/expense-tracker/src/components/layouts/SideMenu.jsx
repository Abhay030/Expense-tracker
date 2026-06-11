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

  return <div className='w-64 h-[calc(100vh-61px)] p-5 sticky top-[61px] z-20' style={{ backgroundColor: '#1A2332', borderRight: '1px solid rgba(148,163,184,0.08)' }}>
    <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-8'>
      {user?.profileImageUrl ? (<img src={user?.profileImageUrl || ""} alt='Profile Image' className='w-20 h-20 object-cover rounded-full shadow-sm' style={{ backgroundColor: '#1E293B', border: '1px solid rgba(148,163,184,0.15)' }} />)
        : (<CharAvatar fullname={user?.fullname} width='w-20' height='h-20' style='text-2xl shadow-sm' />)}

      <h5 className='font-semibold leading-6' style={{ color: '#F1F5F9' }}>
        {user?.fullname || ""}
      </h5>
    </div>

    {SIDE_MENU_DATA.map((item, index) => (
      <button
        key={`menu-${index}`}
        className={`w-full flex items-center gap-4 text-[14px] font-medium transition-all duration-200 py-3 px-5 rounded-lg mb-2 ${activeMenu == item.label
            ? "text-white shadow-sm"
            : "hover:bg-white/5"
          }`}
        style={activeMenu == item.label
          ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))', color: '#8B5CF6' }
          : { color: '#94A3B8' }}
        onClick={() => handleClick(item.path)}
      >
        <item.icon className='text-lg' />
        {item.label}
      </button>
    ))}
  </div>
}

export default SideMenu