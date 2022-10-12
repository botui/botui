import type { Block } from './block.js'

export type Plugin = (block: Block) => Block

export function pluginManager () {
  const plugins: Plugin[] = []

  const registerPlugin = (plugin: Plugin): Plugin[] => {
    plugins.push(plugin)
    return plugins
  }
  const runWithPlugins = (input: Block): Block => {
    let output = input
    plugins.forEach((plugin: Plugin) => {
      output = plugin?.(output)
    })
    return output
  }

  return {
    registerPlugin,
    runWithPlugins
  }
}
