import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react';
import { LuImage, LuX } from "react-icons/lu"

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className='flex flex-col mb-6 relative'>
      <div className='flex items-center gap-4 cursor-pointer w-max' onClick={() => setIsOpen(true)}>
        <div className='w-12 h-12 flex items-center justify-center text-2xl bg-indigo-50 text-primary rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-colors'>
          {icon ? (
            <img src={icon} alt="Icon" className='w-10 h-10 object-contain' />
          ) : (
            <LuImage className='' />
          )
          }
        </div>
        <p className='text-[14px] font-medium text-slate-700'>{icon ? "Change Icon" : "Pick Icon"}</p>
      </div>

      {isOpen && (
        <div className='absolute top-14 left-0 z-50'>
          <button type="button" className='w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full absolute -top-3 -right-3 z-[60] cursor-pointer shadow-md hover:bg-slate-50 transition-colors' onClick={() => setIsOpen(false)}>
            <LuX className='text-slate-500' />
          </button>

          <div className='shadow-xl rounded-xl border border-slate-200/60 overflow-hidden bg-white'>
            <EmojiPicker
              open={isOpen}
              onEmojiClick={(emoji) => {
                onSelect(emoji?.imageUrl || "");
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPickerPopup