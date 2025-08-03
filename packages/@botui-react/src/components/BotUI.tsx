import React, { useState, useEffect } from 'react'
import { IBotuiInterface, IBlock, EBotUIEvents, IBotUIError } from 'botui'
import { ActionContext, BotUIContext, MessageContext } from '../hooks/index.js'
import { BotUIErrorBoundary } from './BotUIErrorBoundary.js'

export type BotUITypes = {
  bot: IBotuiInterface
  children?:
    | JSX.Element
    | JSX.Element[]
    | ((props: {
        bot: IBotuiInterface
        messages: IBlock[]
        action: IBlock | null
        errors: IBotUIError[]
      }) => JSX.Element)
}

export const BotUI = ({ bot, children }: BotUITypes) => {
  const [action, setAction] = useState<IBlock | null>(null)
  const [messages, setMessages] = useState<IBlock[] | []>([])
  const [errors, setErrors] = useState<IBotUIError[]>([])

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

    const handleError = (error: IBotUIError) => {
      setErrors((prevErrors) => [...prevErrors, error])
    }

    const handleErrorClear = () => {
      setErrors([])
    }

    bot?.on(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
    bot?.on(EBotUIEvents.MESSAGE_UPDATE, handleMessageUpdate)
    bot?.on(EBotUIEvents.MESSAGE_REMOVE, handleMessageRemove)
    bot?.on(EBotUIEvents.MESSAGE_CLEAR, handleMessageClear)
    bot?.on(EBotUIEvents.ACTION_SHOW, handleActionShow)
    bot?.on(EBotUIEvents.ERROR_OCCURRED, handleError)
    bot?.on(EBotUIEvents.ERROR_CLEAR, handleErrorClear)

    return () => {
      bot?.off(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
      bot?.off(EBotUIEvents.MESSAGE_UPDATE, handleMessageUpdate)
      bot?.off(EBotUIEvents.MESSAGE_REMOVE, handleMessageRemove)
      bot?.off(EBotUIEvents.MESSAGE_CLEAR, handleMessageClear)
      bot?.off(EBotUIEvents.ACTION_SHOW, handleActionShow)
      bot?.off(EBotUIEvents.ERROR_OCCURRED, handleError)
      bot?.off(EBotUIEvents.ERROR_CLEAR, handleErrorClear)
    }
  }, [bot])

  return (
    <BotUIErrorBoundary
      level="ui"
      onError={(error, errorInfo) => {
        console.error('BotUI Error Boundary:', error, errorInfo)
        // Optionally emit to bot for centralized error handling
        bot?.emit(EBotUIEvents.ERROR_OCCURRED, {
          type: 'unexpected',
          message: error.message,
          cause: error,
        })
      }}
    >
      <BotUIContext.Provider value={{ bot: bot, errors }}>
        <ActionContext.Provider value={action}>
          <MessageContext.Provider value={messages}>
            {typeof children === 'function'
              ? children({ bot, messages, action, errors })
              : children}
          </MessageContext.Provider>
        </ActionContext.Provider>
      </BotUIContext.Provider>
    </BotUIErrorBoundary>
  )
}
