import { expect, jest } from '@jest/globals'

describe('Bot Event Integration', () => {
  let createBot
  let createEventEmitter

  beforeAll(async () => {
    const botuiModule = await import('../dist/botui.js')
    createBot = botuiModule.createBot
    createEventEmitter = botuiModule.createEventEmitter
  })

  test('should integrate with event emitter for message tracking', async () => {
    const bot = createBot()
    const emitter = createEventEmitter()

    // Mock the bot to extend it with event emitter functionality
    // For now, this will test the concept - full integration comes later
    const messageListener = jest.fn()
    emitter.on('message.add', messageListener)

    // Simulate what the integration would look like
    const testMessage = {
      id: 'msg-1',
      content: 'Hello world',
      timestamp: new Date(),
      type: 'bot'
    }

    emitter.emit('message.add', testMessage)
    expect(messageListener).toHaveBeenCalledWith(testMessage)
  })

  test('should handle action events through event emitter', async () => {
    const emitter = createEventEmitter()
    const actionListener = jest.fn()

    emitter.on('action.show', actionListener)

    const testAction = {
      type: 'input',
      id: 'test-action',
      placeholder: 'Enter text'
    }

    emitter.emit('action.show', testAction)
    expect(actionListener).toHaveBeenCalledWith(testAction)
  })

  test('should handle action resolution through event emitter', async () => {
    const emitter = createEventEmitter()
    const resolveListener = jest.fn()

    emitter.on('action.resolve', resolveListener)

    const testResult = {
      value: 'user input'
    }

    emitter.emit('action.resolve', testResult)
    expect(resolveListener).toHaveBeenCalledWith(testResult)
  })

  test('should handle typing indicators through event emitter', async () => {
    const emitter = createEventEmitter()
    const typingListener = jest.fn()

    emitter.on('typing.set', typingListener)

    emitter.emit('typing.set', true)
    expect(typingListener).toHaveBeenCalledWith(true)

    emitter.emit('typing.set', false)
    expect(typingListener).toHaveBeenCalledWith(false)
  })

  test('should handle error events through event emitter', async () => {
    const emitter = createEventEmitter()
    const errorListener = jest.fn()

    emitter.on('error.occurred', errorListener)

    const testError = {
      type: 'network',
      message: 'Connection failed',
      actionId: 'action-1'
    }

    emitter.emit('error.occurred', testError)
    expect(errorListener).toHaveBeenCalledWith(testError)
  })

  test('existing bot functionality should continue to work', async () => {
    const bot = createBot()

    // Test that existing API still works
    expect(typeof bot.message.add).toBe('function')
    expect(typeof bot.action.set).toBe('function')
    expect(typeof bot.next).toBe('function')
    expect(typeof bot.use).toBe('function')
  })
})