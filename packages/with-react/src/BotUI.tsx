import React, { useState, useEffect } from 'react'
import { BotuiInterface, Block, BOTUI_TYPES } from 'botui'
import { ActionContext, BotUIContext, MessageContext } from './hooks'

export type BotUITypes = {
  bot: BotuiInterface
  children?: JSX.Element
}

export const BotUI = ({ bot, children }: BotUITypes) => {
  const [action, setAction] = useState<Block | null>(null)
  const [messages, setMessages] = useState<Block[] | []>([])

  useEffect(() => {
    bot?.onChange?.(BOTUI_TYPES.MESSAGE, (message: Block[]) => {
      setMessages([...message])
    })
    bot?.onChange?.(BOTUI_TYPES.ACTION, (newAction: Block) => {
      setAction({ ...newAction })
    })
  }, [bot])

  return (
    <BotUIContext.Provider value={bot}>
      <ActionContext.Provider value={action}>
        <MessageContext.Provider value={messages}>
          {children}
        </MessageContext.Provider>
      </ActionContext.Provider>
    </BotUIContext.Provider>
  )
}
