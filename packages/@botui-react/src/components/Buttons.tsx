import React from 'react'
import { CSSClasses } from '../types'
import { defaultTexts } from '../const'

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
      onClick={(e) => {
        e.preventDefault()
        props?.onClick?.()
      }}
      className={`${CSSClasses.botui_button} ${props?.classes ?? ''}`}
    >
      {props?.text}
    </button>
  )
}

export function BotUICancelButton(props: BotUICancelButtonTypes) {
  return (
    <BotUIButton
      classes='cancel'
      text={props?.cancelButtonText ?? defaultTexts.buttons.cancel}
      onClick={() => {
        props?.onClick?.({
          canceled: true,
          text: props?.cancelMessageText ?? defaultTexts.messages.cancel,
        })
      }}
    />
  )
}