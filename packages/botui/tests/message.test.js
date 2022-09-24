import { createBot, BOTUI_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'
const storedData = [{
  type: BOTUI_TYPES.MESSAGE,
  data: {
    text: 'hello'
  },
  meta: {
    from: 'human'
  }
}, {
  type: BOTUI_TYPES.MESSAGE,
  data: {
    text: 'hi'
  },
  meta: {
    from: 'bot'
  }
}]

const botui = createBot()

describe('botui.message', () => {
  test('.add adds a message to the list', async () => {
    // add two messages
    await botui.message.add({ text: 'hello' })
    const key = await botui.message.add({ text: 'hello 2' })
    return expect(key).toBeGreaterThanOrEqual(0)
  })

  test('.get returns a message by it\'s key', async () => {
    const block = await botui.message.get(0)
    expect(block.data.text).toEqual('hello')
  })

  test('.update updates a message by it\'s key', async () => {
    const data = await botui.message.update(0, {
      text: 'hi'
    })
    expect(data).toBeUndefined()
  })

  test('.get returns a updated message by it\'s key', async () => {
    const block = await botui.message.get(0)
    expect(block.data.text).toEqual('hi')
  })

  test('.remove removes a message by it\'s key', async () => {
    await botui.message.remove(0)
    const block = await botui.message.get(0)
    expect(block).toBeFalsy()
    const block1 = await botui.message.get(1)
    expect(block1).toBeTruthy()
  })

  test('.removeAll deletes all messages', async () => {
    await botui.message.removeAll()
    const data = await botui.message.getAll()
    expect(data).toEqual([])
  })

  test('.setAll loads messages to the list', async () => {
    await botui.message.setAll(storedData)
    const messages = await botui.message.getAll()
    return expect(storedData).toEqual(messages.map(block => {
      delete block.key // delete .key because it doesn't exist on stored messages
      return block
    }))
  })
})
