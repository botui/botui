import React, { useState, useEffect } from 'react'
import { IBotuiInterface, IBlock, EBotUIEvents } from 'botui'
import { ActionContext, BotUIContext, MessageContext } from '../hooks/index.js'

export type BotUITypes = {
  bot: IBotuiInterface
  children?: JSX.Element | JSX.Element[] | ((props: {
    bot: IBotuiInterface
    messages: IBlock[]
    action: IBlock | null
  }) => JSX.Element)
}

export const BotUI = ({ bot, children }: BotUITypes) => {
  const [action, setAction] = useState<IBlock | null>(null)
  const [messages, setMessages] = useState<IBlock[] | []>([])

  useEffect(() => {
    bot?.on(EBotUIEvents.MESSAGE_ADD, (message: IBlock) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })
    bot?.on(EBotUIEvents.ACTION_SHOW, (newAction: IBlock) => {
      setAction(newAction)
    })
  }, [bot])

  return (
    <BotUIContext.Provider value={{ bot: bot }}>
      <ActionContext.Provider value={action}>
        <MessageContext.Provider value={messages}>
          {typeof children === 'function'
            ? children({ bot, messages, action })
            : children
          }
        </MessageContext.Provider>
      </ActionContext.Provider>
    </BotUIContext.Provider>
  )
}
