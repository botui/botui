import React, { useState, useEffect } from 'react'
import { IBotuiInterface, IBlock, EBotUIEvents } from 'botui'
import { ActionContext, BotUIContext, MessageContext } from '../hooks/index.js'

export type BotUITypes = {
  bot: IBotuiInterface
  children?:
    | JSX.Element
    | JSX.Element[]
    | ((props: {
        bot: IBotuiInterface
        messages: IBlock[]
        action: IBlock | null
      }) => JSX.Element)
}

export const BotUI = ({ bot, children }: BotUITypes) => {
  const [action, setAction] = useState<IBlock | null>(null)
  const [messages, setMessages] = useState<IBlock[] | []>([])

  useEffect(() => {
    const handleMessageAdd = (message: IBlock) => {
      setMessages((prevMessages) => [...prevMessages, message])
    }

    const handleMessageUpdate = ({
      id,
      block,
    }: {
      id: string
      block: IBlock
    }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.key.toString() === id ? block : msg))
      )
    }

    const handleMessageRemove = ({ id }: { id: string }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.key.toString() !== id)
      )
    }

    const handleMessageClear = () => {
      setMessages([])
    }

    const handleActionShow = (newAction: IBlock) => {
      setAction(newAction)
    }

    bot?.on(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
    bot?.on(EBotUIEvents.MESSAGE_UPDATE, handleMessageUpdate)
    bot?.on(EBotUIEvents.MESSAGE_REMOVE, handleMessageRemove)
    bot?.on(EBotUIEvents.MESSAGE_CLEAR, handleMessageClear)
    bot?.on(EBotUIEvents.ACTION_SHOW, handleActionShow)

    return () => {
      bot?.off(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
      bot?.off(EBotUIEvents.MESSAGE_UPDATE, handleMessageUpdate)
      bot?.off(EBotUIEvents.MESSAGE_REMOVE, handleMessageRemove)
      bot?.off(EBotUIEvents.MESSAGE_CLEAR, handleMessageClear)
      bot?.off(EBotUIEvents.ACTION_SHOW, handleActionShow)
    }
  }, [bot])

  return (
    <BotUIContext.Provider value={{ bot: bot }}>
      <ActionContext.Provider value={action}>
        <MessageContext.Provider value={messages}>
          {typeof children === 'function'
            ? children({ bot, messages, action })
            : children}
        </MessageContext.Provider>
      </ActionContext.Provider>
    </BotUIContext.Provider>
  )
}
