import React from 'react'
import { defaultTexts } from '../const.js'

export type BotUICancelButtonTypes = {
  cancelButtonText?: string
  cancelMessageText?: string
  onClick?: (args?: any) => void
}

export type BotUIButtonTypes = {
  text: string
  className?: string
  onClick?: (args?: any) => void
}

export function BotUIButton(props: BotUIButtonTypes) {
  return (
    <button
      onClick={(e) => props?.onClick?.(e)}
      className={props?.className ?? ''}
    >
      {props?.text}
    </button>
  )
}

export function BotUICancelButton(props: BotUICancelButtonTypes) {
  return (
    <BotUIButton
      className="cancel"
      text={props?.cancelButtonText ?? defaultTexts.buttons.cancel}
      onClick={(e) => {
        e.preventDefault()
        props?.onClick?.({
          canceled: true,
          text: props?.cancelMessageText ?? defaultTexts.messages.cancel,
        })
      }}
    />
  )
}
