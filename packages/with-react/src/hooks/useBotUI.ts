import { BotuiInterface } from 'botui'
import { useContext, createContext } from 'react'

export const BotUIContext = createContext<BotuiInterface>({} as BotuiInterface)

/**
 * Returns the current botui object from the React context.
 */
export const useBotUI = (): BotuiInterface => {
  const context = useContext<BotuiInterface>(BotUIContext)
  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context
}
