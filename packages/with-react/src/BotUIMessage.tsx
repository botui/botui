import React from 'react'
import { Block } from 'botui'
import { useBotUIMessage } from './hooks'

export type BotUIMessageTypes = {
  message: Block
}

export const BotUIMessage = ({ message }) => {
  return !message?.data?.text ? null : (
    <div className="botui-message">
      <div className="botui-message-content">{message?.data?.text}</div>
    </div>
  )
}

export const BotUIMessageList = () => {
  const messages = useBotUIMessage()

  return <div className='botui-message-list'>
    {
      messages.map((msg: Block, i: number) => <BotUIMessage key={i} message={msg} />)
    }
  </div>
}
