import { Block, BotuiInterface } from 'botui'
import { useContext, createContext } from 'react'

export const MessageContext = createContext<Block[] | []>([])
export const ActionContext = createContext<Block | null>(null)
export const BotUIContext = createContext<BotuiInterface>({} as BotuiInterface)

/**
 * Get the current botui object from the React context.
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

export const useBotUIMessage = (): Block[] | [] => {
  return useContext(MessageContext)
}

export const useBotUIAction = (): Block | null => {
  return useContext(ActionContext)
}