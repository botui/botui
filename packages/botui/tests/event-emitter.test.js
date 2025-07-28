import { expect, jest } from '@jest/globals'

describe('Event Emitter', () => {
  let createEventEmitter
  let emitter

  beforeAll(async () => {
    const module = await import('../dist/event-emitter.js')
    createEventEmitter = module.createEventEmitter
  })

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  test('should emit and listen to events', () => {
    const listener = jest.fn()
    emitter.on('message.add', listener)

    const message = {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
    }

    emitter.emit('message.add', message)
    expect(listener).toHaveBeenCalledWith(message)
  })

  test('should remove event listeners', () => {
    const listener = jest.fn()
    emitter.on('message.add', listener)
    emitter.off('message.add', listener)

    emitter.emit('message.add', {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
    })

    expect(listener).not.toHaveBeenCalled()
  })

  test('should handle multiple listeners for same event', () => {
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    emitter.on('message.add', listener1)
    emitter.on('message.add', listener2)

    const message = {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
    }

    emitter.emit('message.add', message)

    expect(listener1).toHaveBeenCalledWith(message)
    expect(listener2).toHaveBeenCalledWith(message)
  })

  test('should handle different event types', () => {
    const messageListener = jest.fn()
    const actionListener = jest.fn()
    const typingListener = jest.fn()

    emitter.on('message.add', messageListener)
    emitter.on('action.show', actionListener)
    emitter.on('typing.set', typingListener)

    // Emit different events
    emitter.emit('message.add', { id: 'msg-1', content: 'Hello', timestamp: new Date(), type: 'bot' })
    emitter.emit('action.show', { type: 'input', id: 'action-1' })
    emitter.emit('typing.set', true)

    expect(messageListener).toHaveBeenCalledTimes(1)
    expect(actionListener).toHaveBeenCalledTimes(1)
    expect(typingListener).toHaveBeenCalledTimes(1)
  })

  test('should not call listeners after they are removed', () => {
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    emitter.on('message.add', listener1)
    emitter.on('message.add', listener2)

    // Remove only one listener
    emitter.off('message.add', listener1)

    emitter.emit('message.add', {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
    })

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  test('should handle errors gracefully when removing non-existent listeners', () => {
    const listener = jest.fn()

    // Try to remove a listener that was never added
    expect(() => {
      emitter.off('message.add', listener)
    }).not.toThrow()
  })

  test('should handle emitting events with no listeners', () => {
    expect(() => {
      emitter.emit('message.add', {
        id: 'msg-1',
        content: 'Test message',
        timestamp: new Date(),
        type: 'bot',
      })
    }).not.toThrow()
  })
})