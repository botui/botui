import { createBlock, blockManager } from './block.js' // even though the file has .ts extension, we need to use .js for resolution.
import type {
  Block,
  BlockData,
  BlockMeta,
  BlockManager,
} from './block.js'

import { resolveManager } from './resolve.js'

import { pluginManager } from './plugin.js'
import type { Plugin } from './plugin.js'

import { actionManager } from './action.js'
import type { ActionInterface } from './action.js'

type WaitOptions = {
  /**
   * how long should it wait for? in milliseconds
   * */
  waitTime: number
}

export {
  Block,
  Plugin,
  BlockData,
  BlockMeta,
  WaitOptions,
  BlockManager,
  ActionInterface
}

export interface BotuiInterface {
  message: BlockManager
  action: ActionInterface
  use(plugin: Plugin): BotuiInterface
  next(...args: any[]): BotuiInterface
  wait(): Promise<any>
  wait(
    waitOptions: WaitOptions,
    forwardData?: BlockData,
    forwardMeta?: BlockMeta
  ): Promise<BlockData>
  onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface
}

export type CallbackFunction = (...args: any[]) => void
export enum BlockTypes {
  'ACTION' = 'action',
  'MESSAGE' = 'message',
}

export const BOTUI_BLOCK_TYPES = BlockTypes

export const createBot = (): BotuiInterface => {
  const plugins = pluginManager()
  const stateResolver = resolveManager()

  const callbacks = {
    [BOTUI_BLOCK_TYPES.MESSAGE]: () => {},
    [BOTUI_BLOCK_TYPES.ACTION]: () => {},
  }

  const doCallback = (state = '', data: any) => {
    const callback = callbacks[state] as Function
    callback(data)
  }

  const blocks = blockManager((history) => {
    doCallback(BOTUI_BLOCK_TYPES.MESSAGE, history)
  })

  const currentAction = actionManager((action) => {
    doCallback(BOTUI_BLOCK_TYPES.ACTION, action)
  })

  const botuiInterface: BotuiInterface = {
    /**
     * Add, update or remove messages.
     */
    message: {
      /**
       * Add a new non-action block to the chat list
       */
      add: (
        data: BlockData = { text: '' },
        meta?: BlockMeta
      ): Promise<number> => {
        return new Promise((resolve) => {
          stateResolver.set(resolve)

          const key = blocks.add(
            plugins.runWithPlugins(
              createBlock(BOTUI_BLOCK_TYPES.MESSAGE, meta, data)
            )
          )

          stateResolver.resolve(key)
        })
      },
      /**
       * Get all of the current blocks listed in the chat.
       */
      getAll: (): Promise<Block[]> => Promise.resolve(blocks.getAll()),
      /**
       * Load existing list of blocks
       */
      setAll: (newBlocks: Block[]): Promise<Block[]> => {
        blocks.setAll(newBlocks)
        return Promise.resolve(blocks.getAll())
      },
      /**
       * Get a single block by it's key.
       */
      get: (key: number = 0): Promise<Block> =>
        Promise.resolve(blocks.get(key)),
      /**
       * Remove a single block by it's key.
       */
      remove: (key: number = 0): Promise<void> => {
        blocks.remove(key)
        return Promise.resolve()
      },
      /**
       * @param {BlockData} data an object with any values you want on the block
       * Update a single block by it's key.
       */
      update: (
        key: number = 0,
        data: BlockData = {},
        meta?: BlockMeta
      ): Promise<void> => {
        const existingBlock = blocks.get(key)
        const newMeta = meta
          ? { ...existingBlock.meta, ...meta }
          : existingBlock.meta
        const newData = data
          ? { ...existingBlock.data, ...data }
          : existingBlock.data

        blocks.update(
          key,
          plugins.runWithPlugins(
            createBlock(BOTUI_BLOCK_TYPES.MESSAGE, newMeta, newData, key)
          )
        )
        return Promise.resolve()
      },
      /**
       * Removes all the blocks.
       */
      removeAll: (): Promise<void> => {
        blocks.clear()
        return Promise.resolve()
      },
    },
    action: {
      /**
       * Asks the user to perform an action. BotUI won't go further until
       * this action is resolved by calling `.next()`
       */
      set: (
        data: BlockData = {},
        meta?: BlockMeta
      ): Promise<any> => {
        return new Promise((resolve: any) => {
          const action = createBlock(BOTUI_BLOCK_TYPES.ACTION, meta, data)
          currentAction.set(action)

          stateResolver.set(
            (resolvedData: BlockData, resolvedMeta: BlockMeta) => {
              currentAction.clear()

              if (meta.ephemeral !== true) {
                // ephemeral = short-lived
                blocks.add(
                  plugins.runWithPlugins(
                    createBlock(
                      BOTUI_BLOCK_TYPES.MESSAGE,
                      {
                        ...resolvedMeta,
                        previous: action,
                      },
                      resolvedData
                    )
                  )
                )
              }

              resolve(resolvedData)
            }
          )
        })
      },
      /**
       * Returns the current action or null if there is none.
       * @returns {Promise<Block>}
       */
      get: (): Promise<Block> => {
        return Promise.resolve(currentAction.get())
      },
    },
    /**
     * Wait does not let the next message/action resolve until .next() is called.
     * When `waitTime` property is present in the meta, .next() is called internally with that meta.
     */
    wait: (
      waitOptions?: WaitOptions,
      forwardData?: BlockData,
      forwardMeta?: BlockMeta
    ): Promise<any> => {
      const meta = {
        waiting: true,
        ephemeral: true, // to not add to the message history. see action.set for its usage.
      }

      if (waitOptions?.waitTime) {
        setTimeout(
          () => botuiInterface.next(forwardData, forwardMeta),
          waitOptions.waitTime
        )
      }

      return botuiInterface.action.set({}, meta)
    },
    /**
     * Add a listener for a BlockType.
     */
    onChange: (state: BlockTypes, cb: CallbackFunction): BotuiInterface => {
      callbacks[state] = cb
      return botuiInterface
    },
    /**
     * Resolves current action or wait command. Passed data is sent to the next .then()
     */
    next: (...args: any[]): BotuiInterface => {
      stateResolver.resolve(...args)
      return botuiInterface
    },
    /**
    * Register a plugin to manipulate block data.
    * Example:
    * The plugin below replaces `!(text)` with `<i>text</i>`
    ```
      .use(block => {
        if (block.type == BOTUI_BLOCK_TYPES.MESSAGE) {
          block.data.text = block.data?.text?.replace(/!\(([^\)]+)\)/igm, "<i>$1</i>")
        }
        return block
      })
    ```
    */
    use: (plugin: Plugin): BotuiInterface => {
      plugins.registerPlugin(plugin)
      return botuiInterface
    },
  }

  return botuiInterface
}
