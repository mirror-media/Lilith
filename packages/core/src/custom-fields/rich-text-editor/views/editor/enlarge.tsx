import React from 'react'

export function EnlargeButton(props: {
  onToggle: React.MouseEventHandler
  isEnlarged: boolean
  className: string
}) {
  const { onToggle, isEnlarged, className } = props

  return (
    <div className={className} onClick={onToggle}>
      <i className={isEnlarged ? 'fas fa-compress' : 'fas fa-expand'}></i>
    </div>
  )
}
