import React from 'react'
import { getInitials } from '../../utils/helper'

const CharAvatar = ({fullname , width , height , style}) => {
  return (
    <div className={`${width || 'w-12'} ${height || 'h-12'} ${style || ''} flex items-center justify-center rounded-full font-medium`} style={{ color: '#F1F5F9', backgroundColor: '#1E293B' }}>{getInitials(fullname || '')}</div>
  )
}

export default CharAvatar