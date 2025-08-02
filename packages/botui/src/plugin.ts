import type { IBlock, TPlugin } from './types.js'

// Re-export for backward compatibility
export type { TPlugin as Plugin }

/**
 * Creates a plugin manager for registering and running block transformation plugins.
 *
 * @returns {Object} Plugin manager object with registerPlugin and runWithPlugins methods
 *
 * @example
 * ```typescript
 * import { pluginManager } from 'botui'
 *
 * const plugins = pluginManager()
 *
 * // Register a plugin that transforms text
 * plugins.registerPlugin((block) => {
 *   if (block.type === 'message' && block.data.text) {
 *     block.data.text = block.data.text.toUpperCase()
 *   }
 *   return block
 * })
 *
 * // Run plugins on a block
 * const transformedBlock = plugins.runWithPlugins(myBlock)
 * ```
 */
export function pluginManager() {
  const plugins: TPlugin[] = []

  /**
   * Registers a new plugin to transform blocks.
   *
   * @param {TPlugin} plugin - The plugin function that transforms blocks
   * @returns {TPlugin[]} Array of all registered plugins
   */
  const registerPlugin = (plugin: TPlugin): TPlugin[] => {
    plugins.push(plugin)
    return plugins
  }

  /**
   * Runs all registered plugins on the input block sequentially.
   *
   * @param {IBlock} input - The block to transform
   * @returns {IBlock} The transformed block after running through all plugins
   */
  const runWithPlugins = (input: IBlock): IBlock => {
    let output = input
    plugins.forEach((plugin: TPlugin) => {
      output = plugin?.(output)
    })
    return output
  }

  return {
    registerPlugin,
    runWithPlugins,
  }
}
