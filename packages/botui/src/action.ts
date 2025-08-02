import type { IBlock, TBlockData, TBlockMeta, IActionInterface } from './types.js'

// Re-export for backward compatibility
export type { IActionInterface as ActionInterface }

export function actionManager(callback = (action: IBlock | null) => {}) {
  let currentAction: IBlock | null = null

  return {
    get: () => currentAction,
    set: (action: IBlock) => {
      currentAction = action
      callback(currentAction)
    },
    clear: () => {
      currentAction = null
      callback(currentAction)
    },
  }
}