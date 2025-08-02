import type { IBlock, TBlockData, TBlockMeta, IActionInterface } from './types.js'

// Re-export for backward compatibility
export type { IActionInterface as ActionInterface }

/**
 * Creates an action manager for handling the current active action.
 * Manages the state of the current action and notifies when it changes.
 *
 * @param {Function} [callback] - Optional callback function called when action state changes
 * @returns {Object} Action manager object with get, set, and clear methods
 *
 * @example
 * ```typescript
 * import { actionManager } from 'botui'
 *
 * const currentAction = actionManager((action) => {
 *   console.log('Action changed:', action)
 * })
 *
 * // Set an action
 * currentAction.set(myActionBlock)
 *
 * // Get current action
 * const action = currentAction.get()
 *
 * // Clear the action
 * currentAction.clear()
 * ```
 */
export function actionManager(callback = (action: IBlock | null) => {}) {
  let currentAction: IBlock | null = null

  return {
    /**
     * Gets the current active action.
     *
     * @returns {IBlock | null} The current action block or null if none is active
     */
    get: () => currentAction,

    /**
     * Sets the current active action.
     *
     * @param {IBlock} action - The action block to set as current
     * @returns {void}
     */
    set: (action: IBlock) => {
      currentAction = action
      callback(currentAction)
    },

    /**
     * Clears the current active action.
     *
     * @returns {void}
     */
    clear: () => {
      currentAction = null
      callback(currentAction)
    },
  }
}