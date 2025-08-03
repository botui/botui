import type { IBlock } from 'botui'
import { useContext, createContext } from 'react'

export const ActionContext = createContext<IBlock | null>(null)

/**
 * Returns the current action
 */
export const useBotUIAction = (): IBlock | null => {
  return useContext(ActionContext)
}
