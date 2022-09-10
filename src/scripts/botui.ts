import {
  Block,
  BlockData,
  BlockMeta,
  createBlock,
  blockManager,
  BlockManager,
} from './block'
import { pluginManager, Plugin } from './plugin'
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

function resolveManager() {
  let resolver = (...args: any[]) => {}

  return {
    set: (callback: any): void => {
      resolver = callback
    },
    resolve: (...args: any[]) => resolver(...args),
  }
}

function actionManager(callback = (action: Block | null) => {}) {
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
    message: {
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
      getAll: (): Promise<Block[]> => Promise.resolve(blocks.getAll()),
      get: (index: number = 0): Promise<Block> =>
        Promise.resolve(blocks.get(index)),
      remove: (index: number = 0): Promise<void> => {
        blocks.remove(index)
        return Promise.resolve()
      },
      update: (index: number = 0, block: Block): Promise<void> => {
        blocks.update(index, plugins.runWithPlugins(block))
        return Promise.resolve()
      },
      removeAll: (): Promise<void> => {
        blocks.clear()
        return Promise.resolve()
      },
    },
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
    onChange: (state: BlockTypes, cb: CallbackFunction): BotuiInterface => {
      callbacks[state] = cb
      return botuiInterface
    },
    next: (...args: any[]): BotuiInterface => {
      stateResolver.resolve(...args)
      return botuiInterface
    },
    use: (plugin: Plugin): BotuiInterface => {
      plugins.registerPlugin(plugin)
      return botuiInterface
    },
  }

  return botuiInterface
}
