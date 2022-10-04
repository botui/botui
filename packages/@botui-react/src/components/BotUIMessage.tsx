import React from 'react'
import { Block } from 'botui'
import { CSSClasses } from '../types'
import { useBotUIMessage } from '../hooks'

export type BotUIMessageTypes = {
  message: Block & {
    data: {
      text?: string
    }
  }
}

export const BotUIMessage = ({ message }: BotUIMessageTypes) => {
  return !message?.data?.text ? null : (
    <div className={CSSClasses.botui_message}>
      <div className={CSSClasses.botui_message_content}>{message?.data?.text}</div>
    </div>
  )
}

export const BotUIMessageList = () => {
  const messages = useBotUIMessage()

  return <div className={CSSClasses.botui_message_list}>
    {
      messages.map((msg: Block, i: number) => <BotUIMessage key={i} message={msg} />)
    }
  </div>
}
