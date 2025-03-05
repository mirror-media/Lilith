import React from 'react'
import type { ButtonProps } from './type'

type EnlargeButtonProps = Pick<ButtonProps, 'className'> & {
  onToggle?: () => void
  isEnlarged?: boolean
}

export function EnlargeButton(props: EnlargeButtonProps) {
  const { onToggle, isEnlarged, className } = props

  return (
    <div className={className} onClick={onToggle}>
      <i className={isEnlarged ? 'fas fa-compress' : 'fas fa-expand'}></i>
    </div>
  )
}
