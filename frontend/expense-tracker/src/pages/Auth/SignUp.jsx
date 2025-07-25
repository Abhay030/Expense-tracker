import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/inputs/input'
import { validationEmail } from '../../utils/helper'
import ProfilePhotoSelector from '../../components/inputs/ProfilePhotoSelector'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/userContext'
import { useContext } from 'react'
import uploadImage from '../../utils/uploadImage'

const SignUp = () => {
  const [profilePic, setProfilePic] = useState('')
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')

  const { updateUser } = useContext(UserContext)

  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()

    let profileImageUrl = null

    if(!fullname){
      setError('Please enter your full name')
      return;
    }
    if(!validationEmail(email)) {
      setError('Please enter a valid email address')
      return;
    }
    if(!password){
      setError('Please enter a password')
      return;
    }
    setError('')

    // Sign up call Api

    try{

      // upload profile picture
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullname,
        email,
        password,
        profileImageUrl
      })

      const { token, user } = response.data;

      if(token){
        localStorage.setItem('token', token)
        updateUser(user);
        navigate('/dashboard')
      }
    } catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message)
      }else{
        setError('Something went wrong')
      }
    }
  }


  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>
          Create an Account
        </h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Join us and start tracking your expenses

        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
            <Input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your full name"
              label="Full Name"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              label="Email"
            />
            <div className='col-span-2'>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                label="Password"
                type="password"
              />
            </div>
          </div>

          {error && <p className='text-red-500 text-xs'>{error}</p>}

          <button type='submit' className='bg-primary text-white w-full py-2 rounded-md mt-4 hover:bg-primary/80 transition-all duration-200'>
            Sign Up
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account? {" "}
            <Link className='font-medium text-primary underline' to="/Login">Login</Link>

          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
export default SignUp