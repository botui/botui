import React, { useState, useEffect } from 'react'
import { BotuiInterface, Block, BOTUI_TYPES } from 'botui'
import { CSSClasses } from '../types'
import { ActionContext, BotUIContext, MessageContext } from '../hooks'
import defaultStyles from '../styles/default.theme.module.scss'

export const defaultTheme = defaultStyles

export type BotUITypes = {
  theme?: CSSClasses
  bot: BotuiInterface
  children?: JSX.Element
}

export const BotUI = ({ bot, children, theme = defaultStyles }: BotUITypes) => {
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
    <BotUIContext.Provider value={{ bot: bot, theme: theme }}>
      <ActionContext.Provider value={action}>
        <MessageContext.Provider value={messages}>
          <div className={theme.botui_app_container}>
            <div className={theme.botui_container}>{children}</div>
          </div>
        </MessageContext.Provider>
      </ActionContext.Provider>
    </BotUIContext.Provider>
  )
}
