import React, { useRef , useState } from 'react'
import {LuUser, LuUpload , LuTrash } from 'react-icons/lu'
const ProfilePhotoSelector = ({image , setImage}) => {
    const inputRef = useRef(null);
    const [previewUrl , setPreviewUrl] = useState(null)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
           setImage(file);

           const preview = URL.createObjectURL(file);
           setPreviewUrl(preview);
        }
    }

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl(null);
    }
    const onChooseImage = () => {
        inputRef.current.click();
    }
  return (
    <div className='flex justify-center mb-6'>
        <input 
        type="file"
        accept='image/*'
        ref={inputRef}
        onChange={handleImageChange}
        className='hidden' />

        {!image ? (
            <div className='w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative'>
                <LuUser className='text-4xl text-purple-600 ' />

                <button type='button' 
                className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 '
                onClick={onChooseImage}>

                    <LuUpload/>
                </button>
            </div>

        ) : (
            <div className='relative'>
                <img src={previewUrl} 
                alt="profile Photo"
                className='w-20 h-20 object-cover rounded-full'
                />

                <button type='button'
                className='w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1'
                onClick={handleRemoveImage}>
                    <LuTrash/>
                </button>
            </div>
        )}
    </div>
  )
}

export default ProfilePhotoSelector