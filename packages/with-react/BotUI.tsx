import React from 'react'
import { BotuiInterface } from 'botui'
import { BotUIContext } from './hooks'

export type BotUITypes = {
  bot: BotuiInterface,
  children?: JSX.Element
}

export const BotUI = ({ bot, children }: BotUITypes) => {
  return <BotUIContext.Provider value={bot}>{children}</BotUIContext.Provider>
}