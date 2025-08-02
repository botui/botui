/**
 * Creates a resolve manager for handling asynchronous state resolution.
 * Used internally to manage promises and callbacks for actions and waits.
 *
 * @returns {Object} Resolve manager object with set and resolve methods
 *
 * @example
 * ```typescript
 * import { resolveManager } from 'botui'
 *
 * const stateResolver = resolveManager()
 *
 * // Set a resolver callback
 * stateResolver.set((data) => {
 *   console.log('Resolved with:', data)
 * })
 *
 * // Resolve with data
 * stateResolver.resolve({ result: 'success' })
 * ```
 */
export function resolveManager() {
  let resolver = (...args: any[]) => {}

  return {
    /**
     * Sets the resolver callback function.
     *
     * @param {Function} callback - The callback function to set as the resolver
     * @returns {void}
     */
    set: (callback: any): void => {
      resolver = callback
    },

    /**
     * Calls the current resolver with the provided arguments.
     *
     * @param {...any} args - Arguments to pass to the resolver function
     * @returns {any} The result of calling the resolver function
     */
    resolve: (...args: any[]) => resolver(...args),
  }
}