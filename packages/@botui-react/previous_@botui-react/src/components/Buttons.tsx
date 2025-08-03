import React from 'react'
import { CSSClasses } from '../types.js'
import { defaultTexts } from '../const.js'

export type BotUICancelButtonTypes = {
  cancelButtonText?: string
  cancelMessageText?: string
  onClick?: (args?: any) => void
}

export type BotUIButtonTypes = {
  text: string
  classes?: string
  onClick?: (args?: any) => void
}

export function BotUIButton(props: BotUIButtonTypes) {
  return (
    <button
      onClick={(e) => props?.onClick?.(e)}
      className={`${CSSClasses.botui_button} ${props?.classes ?? ''}`}
    >
      {props?.text}
    </button>
  )
}

export function BotUICancelButton(props: BotUICancelButtonTypes) {
  return (
    <BotUIButton
      classes="cancel"
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
