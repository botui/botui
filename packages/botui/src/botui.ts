import { createBlock, blockManager } from './block.js' // even though the file has .ts extension, we need to use .js for resolution.
import { resolveManager } from './resolve.js'
import { pluginManager } from './plugin.js'
import { actionManager } from './action.js'
import { createEventEmitter } from './event-emitter.js'

// Import enums as values (not types)
import { EBlockTypes, EBotUIEvents } from './types.js'

import type {
  IBlock,
  TPlugin,
  TBlockData,
  TBlockMeta,
  TWaitOptions,
  IBotuiInterface,
} from './types.js'

// Export core types and interfaces
export * from './types.js'

// Export utilities
export { createEventEmitter } from './event-emitter.js'

/**
 * Creates a new BotUI instance with message handling, action management, and event system.
 *
 * @returns {IBotuiInterface} A bot interface with message, action, wait, next, use, and event methods
 *
 * @example
 * ```typescript
 * import { createBot } from 'botui'
 *
 * const bot = createBot()
 *
 * // Add a message
 * await bot.message.add({ text: 'Hello!' })
 *
 * // Create an action
 * await bot.action.set({ type: 'text' })
 *
 * // Listen for events
 * bot.on('message.add', (message) => {
 *   console.log('Message added:', message)
 * })
 * ```
 */
export const createBot = (): IBotuiInterface => {
  const plugins = pluginManager()
  const stateResolver = resolveManager()
  const emitter = createEventEmitter()

  // Legacy callback system removed - using event emitter only

    const blocks = blockManager((history, operation, block) => {
    // Handle operations that don't require a block
    if (operation === 'clear') {
      emitter.emit(EBotUIEvents.MESSAGE_CLEAR, undefined)
      return
    }

    // Handle setAll operation (bulk loading)
    if (operation === 'setAll' && history.length > 0) {
      // For setAll, just emit the last message as an add for backward compatibility
      const lastMessage = history[history.length - 1]
      if (lastMessage && lastMessage.type === EBlockTypes.MESSAGE) {
        emitter.emit(EBotUIEvents.MESSAGE_ADD, lastMessage)
      }
      return
    }

    // Emit events based on the operation performed (requires a block)
    if (block && block.type === EBlockTypes.MESSAGE) {
      switch (operation) {
        case 'add':
          emitter.emit(EBotUIEvents.MESSAGE_ADD, block)
          break
        case 'update':
          emitter.emit(EBotUIEvents.MESSAGE_UPDATE, {
            id: block.key.toString(),
            block: block
          })
          break
        case 'remove':
          emitter.emit(EBotUIEvents.MESSAGE_REMOVE, {
            id: block.key.toString()
          })
          break
      }
    }
  })

  const currentAction = actionManager((action) => {
    if (action) {
      // Only emit action.show for non-ephemeral actions (ephemeral actions like wait should not show UI)
      if (!action.meta?.ephemeral) {
        emitter.emit(EBotUIEvents.ACTION_SHOW, action) // Emit the actual Block, not transformed data
      }

      // Emit busy state for waiting actions
      if (action.meta?.waiting) {
        emitter.emit(EBotUIEvents.BOT_BUSY, { busy: true, source: 'bot' })
      }
    } else {
      emitter.emit(EBotUIEvents.ACTION_CLEAR, undefined)
      // Clear busy state when action is cleared
      emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })
    }

    // Using event emitter only
  })

  const botuiInterface: IBotuiInterface = {
    /**
     * Add, update or remove messages.
     */
    message: {
      /**
       * Add a new non-action block to the chat list
       */
      add: (
        data: TBlockData = { text: '' },
        meta?: TBlockMeta
      ): Promise<number> => {
        return new Promise((resolve) => {
          stateResolver.set(resolve)

          const key = blocks.add(
            plugins.runWithPlugins(createBlock(EBlockTypes.MESSAGE, meta, data))
          )

          stateResolver.resolve(key)
        })
      },
      /**
       * Get all of the current blocks listed in the chat.
       */
      getAll: (): Promise<IBlock[]> => Promise.resolve(blocks.getAll()),
      /**
       * Load existing list of blocks
       */
      setAll: (newBlocks: IBlock[]): Promise<IBlock[]> => {
        blocks.setAll(newBlocks)
        return Promise.resolve(blocks.getAll())
      },
      /**
       * Get a single block by it's key.
       */
      get: (key: number = 0): Promise<IBlock> =>
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
        data: TBlockData = {},
        meta?: TBlockMeta
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
            createBlock(EBlockTypes.MESSAGE, newMeta, newData, key)
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
      set: (data: TBlockData = {}, meta?: TBlockMeta): Promise<any> => {
        return new Promise((resolve: any) => {
          const action = createBlock(EBlockTypes.ACTION, meta, data)
          currentAction.set(action)

          stateResolver.set(
            (resolvedData: TBlockData, resolvedMeta: TBlockMeta) => {
              currentAction.clear()

              if (meta.ephemeral !== true) {
                // ephemeral = short-lived
                blocks.add(
                  plugins.runWithPlugins(
                    createBlock(
                      EBlockTypes.MESSAGE,
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
      get: (): Promise<IBlock> => {
        return Promise.resolve(currentAction.get())
      },
    },
    /**
     * Wait does not let the next message/action resolve until .next() is called.
     * When `waitTime` property is present in the meta, .next() is called internally with that meta.
     */
    wait: (
      waitOptions?: TWaitOptions,
      forwardData?: TBlockData,
      forwardMeta?: TBlockMeta
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
     * Resolves current action or wait command. Passed data is sent to the next .then()
     */
    next: (...args: any[]): IBotuiInterface => {
      stateResolver.resolve(...args)
      // Emit action resolve event - raw args (extensible)
      if (args.length > 0) {
        emitter.emit(EBotUIEvents.ACTION_RESOLVE, args)
      }
      return botuiInterface
    },
    /**
    * Register a plugin to manipulate block data.
    * Example:
    * The plugin below replaces `!(text)` with `<i>text</i>`
    ```
      .use(block => {
        if (block.type == EBlockTypes.MESSAGE) {
          block.data.text = block.data?.text?.replace(/!\(([^\)]+)\)/igm, "<i>$1</i>")
        }
        return block
      })
    ```
    */
    use: (plugin: TPlugin): IBotuiInterface => {
      plugins.registerPlugin(plugin)
      return botuiInterface
    },
    // Event emitter methods
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    emit: emitter.emit.bind(emitter),
    // onChange removed - use event emitter methods instead
  }

  return botuiInterface
}
