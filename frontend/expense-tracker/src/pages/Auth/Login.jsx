import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/inputs/input'
import { validationEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/userContext'


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { updateUser } = useContext(UserContext)

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validationEmail(email)) {
      setError('Please enter a valid email address')
      return;
    }

    if (!password) {
      setError('Please enter a password')
      return;
    }

    setError('')

    // Login call Api

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      })
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token)
        updateUser(user)
        navigate('/dashboard')
      }
    }
    catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      }
      else {
        setError('Something went wrong')
      }
    }
  }

  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className='text-2xl font-bold tracking-tight' style={{ color: '#F1F5F9' }}>Welcome Back</h3>
        <p className='text-[14px] mt-[5px] mb-8' style={{ color: '#94A3B8' }}>Please enter your details to login</p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)} label="Email Address"
            placeholder="abhay@example.com"
            type="text" />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)} label="Password"
            placeholder="Min 8 Characters"
            type="password" />

          {error && <p className='text-rose-500 text-xs font-medium'>{error}</p>}

          <button type='submit' className='btn-primary mt-5 py-2.5'>
            LOGIN
          </button>

          <p className='text-[14px] mt-5 text-center' style={{ color: '#94A3B8' }}>
            Don't have an account?{" "}
            <Link className='font-medium underline' style={{ color: '#8B5CF6' }} to="/signUp">Sign Up</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login