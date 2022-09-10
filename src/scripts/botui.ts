import {
  Block,
  BlockData,
  BlockMeta,
  createBlock,
  blockManager,
  BlockManager,
} from './block'
import { resolveManager } from './resolve'
import { pluginManager, Plugin } from './plugin'
import { actionManager } from './action'
export interface BotuiInterface {
  message: BlockManager
  use(plugin: Plugin): BotuiInterface
  next(...args: any[]): BotuiInterface
  wait(meta: BlockMeta): Promise<void>
  action(data: BlockData, meta: BlockMeta): Promise<void>
  onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface
}
export type CallbackFunction = (...args: any[]) => {}
export enum BlockTypes {
  'ACTION' = 'action',
  'MESSAGE' = 'message',
}

export const BOTUI_TYPES = BlockTypes

export const botuiControl = (): BotuiInterface => {
  const plugins = pluginManager()
  const stateResolver = resolveManager()

  const callbacks = {
    [BOTUI_TYPES.MESSAGE]: () => {},
    [BOTUI_TYPES.ACTION]: () => {},
  }

  const doCallback = (state = '', data: any) => {
    const callback = callbacks[state] as Function
    callback(data)
  }

  const blocks = blockManager((history) => {
    doCallback(BOTUI_TYPES.MESSAGE, history)
  })

  const currentAction = actionManager((action) => {
    doCallback(BOTUI_TYPES.ACTION, action)
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
        meta: BlockMeta = {}
      ): Promise<number> => {
        return new Promise((resolve) => {
          stateResolver.set(resolve)

          const index = blocks.add(
            plugins.runWithPlugins(createBlock(BOTUI_TYPES.MESSAGE, meta, data))
          )

          stateResolver.resolve(index)
        })
      },
      /**
       * Get all of the current blocks listed in the chat.
       */
      getAll: (): Promise<Block[]> => Promise.resolve(blocks.getAll()),
      /**
       * Get a single block by it's index.
       */
      get: (index: number = 0): Promise<Block> =>
        Promise.resolve(blocks.get(index)),
      /**
       * Remove a single block by it's index.
       */
      remove: (index: number = 0): Promise<void> => {
        blocks.remove(index)
        return Promise.resolve()
      },
      /**
       * Update a single block by it's index.
       */
      update: (index: number = 0, block: Block): Promise<void> => {
        blocks.update(index, plugins.runWithPlugins(block))
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
    /**
    * Asks the user to perform an action. BotUI won't go further until
    * this action is resolved by calling `.next()`
    */
    action: (
      data: BlockData = { text: '' },
      meta: BlockMeta = {}
    ): Promise<void> => {
      return new Promise((resolve: any) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)
        currentAction.set(action)

        stateResolver.set((resolvedData: BlockData) => {
          currentAction.clear()

          if (meta.ephemeral !== true) {
            // ephemeral = short-lived
            blocks.add(
              createBlock(
                BOTUI_TYPES.MESSAGE,
                {
                  previous: meta,
                },
                resolvedData
              )
            )
          }

          resolve(resolvedData)
        })
      })
    },
    /**
    * Wait does not let the next message/action resolve until .next() is called.
    * When `waitTime` property is present in the meta, .next() is called internally with that meta.
    */
    wait: (meta: BlockMeta = { waitTime: 0 }): Promise<void> => {
      const forwardMeta = {
        ...meta,
        waiting: true,
        ephemeral: true, // to not add to message history
      }

      if (forwardMeta?.waitTime) {
        setTimeout(() => botuiInterface.next(forwardMeta), forwardMeta.waitTime)
      }

      return botuiInterface.action({}, forwardMeta)
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
        if (block.type == BOTUI_TYPES.MESSAGE) {
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
