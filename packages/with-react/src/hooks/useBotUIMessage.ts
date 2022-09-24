import { Block } from 'botui'
import { useContext, createContext } from 'react'

export const MessageContext = createContext<Block[] | []>([])

/**
 * Returns all the messages
 */
export const useBotUIMessage = (): Block[] | [] => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error(
      `The \`useBotUIMessage\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context
}
