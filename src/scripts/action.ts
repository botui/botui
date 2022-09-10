import type { Block } from './block'

export function actionManager(callback = (action: Block | null) => {}) {
  let currentAction: Block | null = null

  return {
    get: () => currentAction,
    set: (action: Block) => {
      currentAction = action
      callback(currentAction)
    },
    clear: () => {
      currentAction = null
      callback(currentAction)
    },
  }
}