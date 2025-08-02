import { createBot } from '../dist/botui'
import { expect, jest } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('Bot EventEmitter Integration', () => {
  test('bot inherits EventEmitter methods correctly', () => {
    const bot = createBot()

    // Verify all EventEmitter methods are available
    expect(typeof bot.on).toBe('function')
    expect(typeof bot.off).toBe('function')
    expect(typeof bot.emit).toBe('function')
  })

  test('bot.on() registers event listeners correctly', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.add', listener)

    // Trigger a message.add event
    await bot.message.add({ text: 'test message' })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { text: 'test message' },
        type: 'message',
        key: expect.any(Number)
      })
    )
  })

  test('bot.off() removes event listeners correctly', async () => {
    const bot = createBot()
    const listener = jest.fn()

    // Add listener
    bot.on('action.show', listener)
    bot.action.set({}, { actionType: 'input' })
    await waitPromise(50)
    expect(listener).toHaveBeenCalledTimes(1)

    // Remove listener
    bot.off('action.show', listener)
    listener.mockClear()

    // Trigger again - should not call listener
    bot.action.set({}, { actionType: 'input' })
    await waitPromise(50)
    expect(listener).not.toHaveBeenCalled()
  })

  test('bot.emit() triggers events manually', () => {
    const bot = createBot()
    const errorListener = jest.fn()
    const busyListener = jest.fn()

    bot.on('error.occurred', errorListener)
    bot.on('bot.busy', busyListener)

    // Manually emit events
    const testError = { type: 'validation', message: 'Test error' }
    const testBusy = { busy: true, source: 'system' }

    bot.emit('error.occurred', testError)
    bot.emit('bot.busy', testBusy)

    expect(errorListener).toHaveBeenCalledWith(testError)
    expect(busyListener).toHaveBeenCalledWith(testBusy)
  })

  test('multiple listeners for same event work correctly', () => {
    const bot = createBot()
    const listener1 = jest.fn()
    const listener2 = jest.fn()
    const listener3 = jest.fn()

    bot.on('error.occurred', listener1)
    bot.on('error.occurred', listener2)
    bot.on('error.occurred', listener3)

    const testError = { type: 'network', message: 'Connection failed' }
    bot.emit('error.occurred', testError)

    expect(listener1).toHaveBeenCalledWith(testError)
    expect(listener2).toHaveBeenCalledWith(testError)
    expect(listener3).toHaveBeenCalledWith(testError)
  })

  test('removing one listener does not affect others', () => {
    const bot = createBot()
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    bot.on('message.add', listener1)
    bot.on('message.add', listener2)

    // Remove only listener1
    bot.off('message.add', listener1)

    const testMessage = { id: 'msg-1', content: 'test', type: 'bot' }
    bot.emit('message.add', testMessage)

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledWith(testMessage)
  })

  test('event listeners survive across multiple operations', async () => {
    const bot = createBot()
    const messageListener = jest.fn()
    const actionListener = jest.fn()

    bot.on('message.add', messageListener)
    bot.on('action.show', actionListener)

    // Multiple operations
    await bot.message.add({ text: 'first' })
    await bot.message.add({ text: 'second' })
    bot.action.set({}, { actionType: 'input' })
    bot.action.set({}, { actionType: 'select' })

    await waitPromise(100)

    expect(messageListener).toHaveBeenCalledTimes(2)
    expect(actionListener).toHaveBeenCalledTimes(2)
  })
})