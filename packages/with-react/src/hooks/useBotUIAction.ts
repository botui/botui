import { Block } from 'botui'
import { useContext, createContext } from 'react'

export const ActionContext = createContext<Block | null>(null)

/**
 * Returns the current action
 */
export const useBotUIAction = (): Block | null => {
  const context = useContext(ActionContext)
  if (!context) {
    throw new Error(
      `The \`useBotUIAction\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context
}
