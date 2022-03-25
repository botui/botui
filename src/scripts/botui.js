
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
  let currentAction = null

  let callback = () => {}
  const doCallback = () => {
    callback(currentAction, history)
  }

  const doResolve = (...args) => {
    resolver(...args)
  }

  const msg = {
    add: (block) => {
      // if (block?.meta?.ephemeral) return

      const index = history.push(block)
      doCallback()
      return index - 1
    },
    update: (index, block) => {
      console.log('update', index, history[index])

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
        meta.ephemeral = true
        const index = msg.add(createBlock(BOTUI_TYPES.WAIT, meta))
        setTimeout(() => {
          msg.remove(index)
          doResolve()
        }, meta.time)
      })
    },
    action: (meta = {}, data = { text: '' }) => {
      return new Promise((resolve) => {
        const action = createBlock(BOTUI_TYPES.ACTION, meta, data)

        currentAction = action
        const index = msg.add(action)

        resolver = (...args) => {
          currentAction = null
          msg.update(index, createBlock(BOTUI_TYPES.MESSAGE, {
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
