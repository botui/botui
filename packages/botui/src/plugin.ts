import type { IBlock, TPlugin } from './types.js'

// Re-export for backward compatibility
export type { TPlugin as Plugin }

export function pluginManager () {
  const plugins: TPlugin[] = []

  const registerPlugin = (plugin: TPlugin): TPlugin[] => {
    plugins.push(plugin)
    return plugins
  }
  const runWithPlugins = (input: IBlock): IBlock => {
    let output = input
    plugins.forEach((plugin: TPlugin) => {
      output = plugin?.(output)
    })
    return output
  }

  return {
    registerPlugin,
    runWithPlugins
  }
}