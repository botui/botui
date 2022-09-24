import { BotuiInterface } from 'botui'
import { useContext, createContext } from 'react'
import { CSSClasses } from '../types'

type BotContext = {
  theme: CSSClasses
  bot: BotuiInterface
}

export const BotUIContext = createContext<BotContext>({} as BotContext)

/**
 * Returns the current botui object from the React context.
 */
export const useBotUI = (): BotuiInterface => {
  const context = useContext<BotContext>(BotUIContext)
  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context.bot
}

/**
 * Returns the current botui theme object from the React context.
 */
export const useBotTheme = (): CSSClasses => {
  const context = useContext<BotContext>(BotUIContext)
  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context.theme
}
