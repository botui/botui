import type { IBlock } from 'botui'
import { useContext, createContext } from 'react'

export const MessageContext = createContext<IBlock[] | []>([])

/**
 * Returns all the messages
 */
export const useBotUIMessage = (): IBlock[] | [] => {
  return useContext(MessageContext)
}
