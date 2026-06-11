import React, { useRef, useState } from 'react'
import { LuUser, LuUpload, LuTrash } from 'react-icons/lu'
const ProfilePhotoSelector = ({ image, setImage }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null)
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
                <div className='w-20 h-20 flex items-center justify-center rounded-full relative shadow-sm' style={{ backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <LuUser className='text-4xl text-primary' />

                    <button type='button'
                        className='w-8 h-8 flex items-center justify-center text-white rounded-full absolute -bottom-1 -right-1 shadow-sm hover:scale-105 transition-transform' style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
                        onClick={onChooseImage}>

                        <LuUpload />
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
                        <LuTrash />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProfilePhotoSelector