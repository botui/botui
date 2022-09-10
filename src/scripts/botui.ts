export interface Block {
  type: string
  meta: blockMeta
  data: blockData
}

export interface MessageInterface {
  add (data: blockData, meta: blockMeta): Promise<number>
  getAll (): Promise<Block[]>
  get (index: number): Promise<Block>
  remove (index: number): Promise<void>
  update (index: number, block: Block): Promise<void>
  removeAll (): Promise<void>
}
export interface BotuiInterface {
  message: MessageInterface
  use (plugin: plugin): BotuiInterface
  next (...args: any[]): BotuiInterface
  wait (meta: blockMeta): Promise<void>
  action (data: blockData, meta: blockMeta): Promise<void>
  onChange (state: BotuiTypes, cb: callbackFunction): BotuiInterface,
}

export type blockMeta = {
  type?: string
  waitTime?: number
  waiting?: boolean
  ephemeral?: boolean
  previous?: object
}

type blockData = {}
type History = Block[]
export type plugin = (block: Block) => Block
type callbackFunction = (...args: any[]) => {}

export enum BotuiTypes {
  'ACTION' = 'action',
  'MESSAGE' = 'message'
}

export const BOTUI_TYPES = BotuiTypes

function createBlock (type: string, meta: blockMeta, data: blockData): Block {
  return {
    type: type,
    meta: meta,
    data: data
  }
}

function resolveManager () {
  let resolver = (...args: any[]) => {}

  return {
    set: (callback: any): void => {
      resolver = callback
    },
    resolve: (...args: any[]) => resolver(...args)
  }
}

function messageManager (callback = (history: History = []) => {}) {
  let history: History = []
  return {
    getAll: () => history,
    get: (index = 0) => history[index],
    add: (block: Block): number => {
      const length = history.push(block)
      callback(history)
      return length - 1
    },
    update: (index: number, block: Block): void => {
      history[index] = block
      callback(history)
    },
    remove: (index: number): void => {
      history.splice(index, 1)
      callback(history)
    },
    clear: (): void => {
      history = []
      callback(history)
    }
  }
}

function actionManager (callback = (action: Block | null) => {}) {
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
    }
  }
}

export const botuiControl = (): BotuiInterface => {
  const plugins: plugin[] = []
  const stateResolver = resolveManager()

  const callbacks = {
    [BOTUI_TYPES.MESSAGE]: () => {},
    [BOTUI_TYPES.ACTION]: () => {}
  }

  const doCallback = (state = '', data: any) => {
    const callback = callbacks[state] as Function
    callback(data)
  }

  const runWithPlugins = (input: Block): Block => {
    let output = input
    plugins.forEach((plugin: plugin) => {
      output = plugin?.(input)
    })
    return output
  }

  const msg = messageManager((history) => {
    doCallback(BOTUI_TYPES.MESSAGE, history)
  })

  const currentAction = actionManager((action) => {
    doCallback(BOTUI_TYPES.ACTION, action)
  })

  const botuiInterface: BotuiInterface = {
    message: {
      add: (data: blockData = { text: '' }, meta: blockMeta = {}): Promise<number> => {
        return new Promise((resolve) => {
          stateResolver.set(resolve)

          const index = msg.add(
            runWithPlugins(
              createBlock(BOTUI_TYPES.MESSAGE, meta, data)
            )
          )

          stateResolver.resolve(index)
        })
      },
      getAll: (): Promise<Block[]> => Promise.resolve(msg.getAll()),
      get: (index: number = 0): Promise<Block> => Promise.resolve(msg.get(index)),
      remove: (index: number = 0): Promise<void> => {
        msg.remove(index)
        return Promise.resolve()
      },
      update: (index: number = 0, block: Block): Promise<void> => {
        msg.update(index, runWithPlugins(block))
        return Promise.resolve()
      },
      removeAll: (): Promise<void> => {
        msg.clear()
        return Promise.resolve()
      }
    },
    action: (data: blockData = { text: '' }, meta: blockMeta = {}): Promise<void> => {
      return new Promise((resolve: any) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)
        currentAction.set(action)

        stateResolver.set((resolvedData: blockData) => {
          currentAction.clear()

          if (meta.ephemeral !== true) { // ephemeral = short-lived
            msg.add(createBlock(BOTUI_TYPES.MESSAGE, {
              previous: meta
            }, resolvedData))
          }

          resolve(resolvedData)
        })
      })
    },
    wait: (meta: blockMeta = { waitTime: 0 }): Promise<void> => {
      const forwardMeta = {
        ...meta,
        waiting: true,
        ephemeral: true // to not add to message history
      }

      if (forwardMeta?.waitTime) {
        setTimeout(() => botuiInterface.next(forwardMeta), forwardMeta.waitTime)
      }

      return botuiInterface.action({}, forwardMeta)
    },
    onChange: (state: BotuiTypes, cb: callbackFunction): BotuiInterface => {
      callbacks[state] = cb
      return botuiInterface
    },
    next: (...args: any[]): BotuiInterface => {
      stateResolver.resolve(...args)
      return botuiInterface
    },
    use: (plugin: plugin): BotuiInterface => {
      plugins.push(plugin)
      return botuiInterface
    }
  }

  return botuiInterface
}
