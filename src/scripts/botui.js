
export const BOTUI_TYPES = {
  ACTION: 'action',
  MESSAGE: 'message',
}

const createBlock = (type = '', meta = {}, data = {}) => {
  return {
    type: type,
    meta: meta,
    data: data
  }
}

export const botuiControl = () => {
  const localState = {
    resolver: () => {},

    [BOTUI_TYPES.MESSAGE]: [],
    [BOTUI_TYPES.ACTION]: null
  }

  const plugins = []

  const callbacks = {
    [BOTUI_TYPES.MESSAGE]: () => {},
    [BOTUI_TYPES.ACTION]: () => {}
  }

  const doCallback = (state = '') => {
    callbacks[state](localState[state])
  }

  const doResolve = (...args) => {
    localState.resolver(...args)
  }

  const currentAction = {
    get: () => localState[BOTUI_TYPES.ACTION],
    set: (action) => {
      localState[BOTUI_TYPES.ACTION] = action
      doCallback(BOTUI_TYPES.ACTION)
    },
    clear: () => {
      localState[BOTUI_TYPES.ACTION] = null
      doCallback(BOTUI_TYPES.ACTION)
    }
  }

  const runWithPlugins = (input) => {
    let output = input
    plugins.forEach(plugin => {
      output = plugin?.(input)
    })
    return output
  }

  const msg = {
    getAll: () => localState[BOTUI_TYPES.MESSAGE],
    get: (index = 0) => localState[BOTUI_TYPES.MESSAGE][index],
    add: (block) => {
      let pluginOutput = runWithPlugins(block)
      const length = localState[BOTUI_TYPES.MESSAGE].push(pluginOutput)
      doCallback(BOTUI_TYPES.MESSAGE)
      return length - 1
    },
    update: (index, block) => {
      let pluginOutput = runWithPlugins(block)
      localState[BOTUI_TYPES.MESSAGE][index] = pluginOutput
      doCallback(BOTUI_TYPES.MESSAGE)
    },
    remove: (index) => {
      localState[BOTUI_TYPES.MESSAGE].splice(index, 1)
      doCallback(BOTUI_TYPES.MESSAGE)
    },
    clear: () => {
      localState[BOTUI_TYPES.MESSAGE] = []
      doCallback(BOTUI_TYPES.MESSAGE)
    }
  }

  const botuiInterface = {
    message: {
      add: (data = { text: '' }, meta = {}) => {
        return new Promise(resolve => {
          localState.resolver = resolve
          const index = msg.add(createBlock(BOTUI_TYPES.MESSAGE, meta, data))
          doResolve(index)
        })
      },
      getAll: () => Promise.resolve(msg.getAll()),
      get: (index = 0) => Promise.resolve(msg.get(index)),
      remove: (index = 0) => {
        msg.remove(index)
        return Promise.resolve()
      },
      update: (index = 0, block) => {
        msg.update(index, block)
        return Promise.resolve()
      },
      removeAll: () => {
        msg.clear()
        return Promise.resolve()
      }
    },
    action: (data = { text: '' }, meta = {}) => {
      return new Promise((resolve) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)
        currentAction.set(action)

        localState.resolver = (...args) => {
          currentAction.clear()

          if (meta.ephemeral !== true) { // ephemeral = short-lived
            msg.add(createBlock(BOTUI_TYPES.MESSAGE, {
              type: BOTUI_TYPES.ACTION
            }, ...args))
          }

          resolve(...args)
        }
      })
    },
    wait: (meta = { waitTime: 0 }) => {
      meta.waiting = true
      meta.ephemeral = true // to not add to message history

      if (meta?.waitTime) {
        setTimeout(() => botuiInterface.next(meta), meta.waitTime)
      }

      return botuiInterface.action({}, meta)
    },
    onChange: (state = '', cb = () => {}) => {
      callbacks[state] = cb
      return botuiInterface
    },
    next: (...args) => {
      doResolve(...args)
      return botuiInterface
    },
    use: (plugin = () => {}) => {
      plugins.push(plugin)
      return botuiInterface
    }
  }

  return botuiInterface
}
