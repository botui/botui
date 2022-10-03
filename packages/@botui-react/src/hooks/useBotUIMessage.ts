import { Block } from 'botui'
import { useContext, createContext } from 'react'

export const MessageContext = createContext<Block[] | []>([])

/**
 * Returns all the messages
 */
export const useBotUIMessage = (): Block[] | [] => {
  return useContext(MessageContext)
}
