import React from 'react'
import { Block } from 'botui'
import { useBotTheme, useBotUIMessage } from '../hooks'

export type BotUIMessageTypes = {
  message: Block & {
    data: {
      text?: string
    }
  }
}

export const BotUIMessage = ({ message }: BotUIMessageTypes) => {
  const theme = useBotTheme()
  return !message?.data?.text ? null : (
    <div className={theme.botui_message}>
      <div className={theme.botui_message_content}>{message?.data?.text}</div>
    </div>
  )
}

export const BotUIMessageList = () => {
  const theme = useBotTheme()
  const messages = useBotUIMessage()

  return <div className={theme.botui_message_list}>
    {
      messages.map((msg: Block, i: number) => <BotUIMessage key={i} message={msg} />)
    }
  </div>
}
