import React from 'react'
import { BotUIContext } from './hooks'

export const BotUI = ({ bot, children }) => {
  return <BotUIContext.Provider value={bot}>{children}</BotUIContext.Provider>
}