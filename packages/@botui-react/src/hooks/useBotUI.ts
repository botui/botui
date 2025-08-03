import { IBotUIError, IBotuiInterface } from 'botui'
import { useContext, createContext } from 'react'

type BotContext = {
  bot: IBotuiInterface
  errors: IBotUIError[]
}

export const BotUIContext = createContext<BotContext>({} as BotContext)

/**
 * Returns the current botui object from the React context.
 */
export const useBotUI = (): IBotuiInterface => {
  const context = useContext<BotContext>(BotUIContext)
  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context.bot
}
