
const spec = require('./targetspec.json')

const flow = spec.flow

let resolver = null

const botui = {
  show: (text = '') => {
    return new Promise((resolve) => {
      console.log(text)
      resolve()
    })
  },
  wait: (time = 0) => {
    return new Promise((resolve) => {
      resolver = resolve
      setTimeout(resolve, time)
    })
  },
  input: (text = '') => {
    return new Promise((resolve) => {
      resolver = resolve
      console.log(text)
    })
  },
  next: (...args) => {
    resolver(...args)
  }
}

// botui.show('hello')
//   .then(() => botui.wait(1000))
//   .then(() => botui.show('your name'))
//   .then(() => botui.wait(1000))
//   .then(() => {
//     console.log('in then')
//     return botui.input('name:')
//   })
//   .then((arg) => {
//     botui.show('nice to meet you ' + arg)
//   })

// setTimeout(() => {
//   botui.next('john')
// }, 3000)

function convertContentToString (content = []) {
  return content.map(item => {
    if (typeof item == 'string') {
      return item
    }
    if (item.key) return spec.data[item.key]
  }).join('')
}

function performWork () {
  const action = flow.shift()

  let next = null
  if (action.type == 'output') {
    const content = typeof action.content == 'object' ? convertContentToString(action.content) : action.content
    next = botui.show(content)
  }
  if (action.type == 'input') {
    setTimeout(() => botui.next(spec.data[action.key]), 1000)
    next = botui.input(action.key)
  }
  if (action.type == 'wait') {
    next = botui.wait(action.time)
  }

  next?.then(() => {
    console.log('in then', action.type, flow.length);
    if (flow.length) {
      performWork()
    }
  })
}

performWork()
