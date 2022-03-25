
export const BOTUI_TYPES = {
  WAIT: 'wait',
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
  const history = []
  let resolver = null
  let _currentAction = null

  let callback = () => {}
  const doCallback = () => {
    callback(_currentAction, history)
  }

  const doResolve = (...args) => {
    resolver(...args)
  }

  const currentAction = {
    set: (action) => {
      _currentAction = action
      doCallback()
    },
    get: () => action,
    clear: () => {
      _currentAction = null
      doCallback()
    }
  }

  const msg = {
    add: (block) => {
      const length = history.push(block)
      doCallback()
      return length - 1
    },
    update: (index, block) => {
      history[index] = block
      doCallback()
    },
    remove: (index) => {
      history.splice(index, 1)
      doCallback()
    }
  }

  return {
    message: (meta = {}, data = { text: '' }) => {
      return new Promise((resolve) => {
        resolver = resolve
        msg.add(createBlock(BOTUI_TYPES.MESSAGE, meta, data))
        doResolve()
      })
    },
    wait: (meta = { time: 0 }) => {
      return new Promise((resolve) => {
        resolver = resolve
        currentAction.set(createBlock(BOTUI_TYPES.WAIT, meta))
        setTimeout(() => {
          currentAction.clear()
          doResolve()
        }, meta.time)
      })
    },
    action: (meta = {}, data = { text: '' }) => {
      return new Promise((resolve) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)
        currentAction.set(action)

        resolver = (...args) => {
          currentAction.clear()

          msg.add(createBlock(BOTUI_TYPES.MESSAGE, {
            type: BOTUI_TYPES.ACTION
          }, ...args))

          resolve(...args)
        }
      })
    },
    onCallback: (cb = () => {}) => {
      callback = cb
    },
    next: (...args) => {
      doResolve(...args)
    }
  }
}
