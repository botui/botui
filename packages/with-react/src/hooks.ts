import { Block, BotuiInterface } from 'botui'
import { useContext, createContext } from 'react'

export const MessageContext = createContext<Block[] | []>([])
export const ActionContext = createContext<Block | null>(null)
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

/**
 * Returns all the messages
 */
export const useBotUIMessage = (): Block[] | [] => {
  return useContext(MessageContext)
}
/**
 * Returns the current action
 */
export const useBotUIAction = (): Block | null => {
  return useContext(ActionContext)
}