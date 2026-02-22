import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'

const Input = ({ value, onChange, placeholder, label, type }) => {
    const [showPassword, setShowPassword] = useState(false)

    const toggleShowPassword = () => {
        setShowPassword(prev => !prev)
    }

    return (
        <div>
            <label className='text-[13px] font-medium text-slate-700 block'>{label}</label>
            <div className='input-box '>
                <input
                    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    className='w-full bg-transparent outline-none placeholder:text-slate-400'
                    value={value}
                    onChange={onChange}
                />
                {type === 'password' && (
                    showPassword ? (
                        <FaRegEye
                            size={22}
                            className='text-primary cursor-pointer'
                            onClick={toggleShowPassword}
                        />
                    ) : (
                        <FaRegEyeSlash
                            size={22}
                            className='text-slate-400 cursor-pointer'
                            onClick={toggleShowPassword}
                        />
                    )
                )}
            </div>
        </div>
    )
}

export default Input
