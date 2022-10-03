import { Block } from 'botui'
import { useContext, createContext } from 'react'

export const ActionContext = createContext<Block | null>(null)

/**
 * Returns the current action
 */
export const useBotUIAction = (): Block | null => {
  return useContext(ActionContext)
}
