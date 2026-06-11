import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react';
import { LuImage, LuX } from "react-icons/lu"

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className='flex flex-col mb-6 relative'>
      <div className='flex items-center gap-4 cursor-pointer w-max' onClick={() => setIsOpen(true)}>
        <div className='w-12 h-12 flex items-center justify-center text-2xl text-primary rounded-xl shadow-sm border transition-colors cursor-pointer' style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.15)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}>
          {icon ? (
            <img src={icon} alt="Icon" className='w-10 h-10 object-contain' />
          ) : (
            <LuImage className='' />
          )
          }
        </div>
        <p className='text-[14px] font-medium' style={{ color: '#94A3B8' }}>{icon ? "Change Icon" : "Pick Icon"}</p>
      </div>

      {isOpen && (
        <div className='absolute top-14 left-0 z-50'>
          <button type="button" className='w-8 h-8 flex items-center justify-center rounded-full absolute -top-3 -right-3 z-[60] cursor-pointer shadow-md transition-colors' style={{ backgroundColor: '#1E293B', border: '1px solid rgba(148,163,184,0.15)', color: '#94A3B8' }} onClick={() => setIsOpen(false)}>
            <LuX className='text-slate-500' />
          </button>

          <div className='shadow-xl rounded-xl overflow-hidden' style={{ backgroundColor: '#1A2332', border: '1px solid rgba(148,163,184,0.12)' }}>
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