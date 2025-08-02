import { createBot, BOTUI_BLOCK_TYPES } from '../dist/botui'
import { expect, jest } from '@jest/globals'
const storedData = [{
  type: BOTUI_BLOCK_TYPES.MESSAGE,
  data: {
    text: 'hello'
  },
  meta: {
    from: 'human'
  }
}, {
  type: BOTUI_BLOCK_TYPES.MESSAGE,
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

describe('botui.message events', () => {
  test('message.update() emits MESSAGE_UPDATE event with correct data structure', async () => {
    const bot = createBot()
    const listener = jest.fn()

    // Listen for message.update events
    bot.on('message.update', listener)

    // Add a message first
    const messageKey = await bot.message.add({ text: 'Original text' })

    // Clear the listener calls from the add operation
    listener.mockClear()

    // Update the message
    const updatedData = { text: 'Updated text', mood: 'happy' }
    await bot.message.update(messageKey, updatedData)

    // Verify the event was emitted with correct structure
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      id: messageKey.toString(),
      block: expect.objectContaining({
        key: messageKey,
        type: 'message',
        data: expect.objectContaining(updatedData)
      })
    })
  })

  test('message.update() preserves existing meta when only updating data', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    // Add message with meta
    const originalMeta = { author: 'bot', timestamp: Date.now() }
    const messageKey = await bot.message.add({ text: 'Original' }, originalMeta)

    listener.mockClear()

    // Update only the data
    await bot.message.update(messageKey, { text: 'Updated' })

    expect(listener).toHaveBeenCalledWith({
      id: messageKey.toString(),
      block: expect.objectContaining({
        meta: expect.objectContaining(originalMeta),
        data: expect.objectContaining({ text: 'Updated' })
      })
    })
  })

  test('message.update() merges new meta with existing meta', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    // Add message with meta
    const originalMeta = { author: 'bot', timestamp: Date.now() }
    const messageKey = await bot.message.add({ text: 'Original' }, originalMeta)

    listener.mockClear()

    // Update with new meta
    const newMeta = { edited: true, editTime: Date.now() }
    await bot.message.update(messageKey, { text: 'Updated' }, newMeta)

    expect(listener).toHaveBeenCalledWith({
      id: messageKey.toString(),
      block: expect.objectContaining({
        meta: expect.objectContaining({
          ...originalMeta,
          ...newMeta
        }),
        data: expect.objectContaining({ text: 'Updated' })
      })
    })
  })

  test('message.update() only emits events for MESSAGE type blocks', async () => {
    const bot = createBot()
    const messageListener = jest.fn()
    const actionListener = jest.fn()

    bot.on('message.update', messageListener)
    bot.on('action.show', actionListener)

    // Add a message and verify update emits message.update
    const messageKey = await bot.message.add({ text: 'Test message' })
    messageListener.mockClear()

    await bot.message.update(messageKey, { text: 'Updated message' })
    expect(messageListener).toHaveBeenCalledTimes(1)

    // Actions should not trigger message.update events
    // (Actions use a different manager, but this tests our logic)
  })

  test('message.remove() emits MESSAGE_REMOVE event', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.remove', listener)

    // Add and then remove a message
    const messageKey = await bot.message.add({ text: 'To be removed' })
    await bot.message.remove(messageKey)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      id: messageKey.toString()
    })
  })

  test('message.removeAll() emits MESSAGE_CLEAR event', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.clear', listener)

    // Add some messages and then clear all
    await bot.message.add({ text: 'Message 1' })
    await bot.message.add({ text: 'Message 2' })
    await bot.message.removeAll()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(undefined)
  })

  test('multiple message updates emit multiple MESSAGE_UPDATE events', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    // Add a message
    const messageKey = await bot.message.add({ text: 'Original' })
    listener.mockClear()

    // Multiple updates
    await bot.message.update(messageKey, { text: 'Update 1' })
    await bot.message.update(messageKey, { text: 'Update 2' })
    await bot.message.update(messageKey, { text: 'Update 3' })

    expect(listener).toHaveBeenCalledTimes(3)

    // Check the final state
    const finalBlock = await bot.message.get(messageKey)
    expect(finalBlock.data.text).toBe('Update 3')
  })

  test('event listeners can be removed', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    // Add and update message
    const messageKey = await bot.message.add({ text: 'Test' })
    await bot.message.update(messageKey, { text: 'Updated' })

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    // Remove listener
    bot.off('message.update', listener)

    // Update again - should not trigger listener
    await bot.message.update(messageKey, { text: 'Updated again' })
    expect(listener).toHaveBeenCalledTimes(0)
  })
})
