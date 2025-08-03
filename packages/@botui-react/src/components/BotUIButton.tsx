import React from 'react'
import { CSSClasses } from '../types.js'
import { defaultTexts } from '../const.js'

export interface BotUIButtonProps {
  text: string
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  [key: string]: any
}

export interface BotUICancelButtonProps {
  cancelButtonText?: string
  cancelMessageText?: string
  disabled?: boolean
  className?: string
  onClick?: (cancelData: { canceled: true; text: string }) => void
  [key: string]: any
}

export function BotUIButton({
  text,
  className = '',
  type = 'submit',
  onClick,
  ...props
}: BotUIButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${CSSClasses.botui_button} ${className}`}
      {...props}
    >
      {text}
    </button>
  )
}

export function BotUICancelButton({
  cancelButtonText,
  cancelMessageText,
  onClick,
  className = '',
  ...props
}: BotUICancelButtonProps) {
  return (
    <BotUIButton
      type="button"
      className={`cancel ${className}`}
      text={cancelButtonText ?? defaultTexts.buttons.cancel}
      onClick={(e) => {
        e.preventDefault()
        onClick?.({
          canceled: true,
          text: cancelMessageText ?? defaultTexts.messages.cancel,
        })
      }}
      {...props}
    />
  )
}