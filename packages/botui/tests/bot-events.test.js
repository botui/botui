import { createBot } from '../dist/botui'
import { expect, jest } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('Bot Event Emission', () => {
  test('message.add() emits message.add event with correct data', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.add', listener)

    const messageData = { text: 'Hello world', emoji: '👋' }
    await bot.message.add(messageData)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.any(Number),
        data: messageData,
        type: 'message'
      })
    )
  })

  test('action.set() emits action.show event for regular actions', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('action.show', listener)

    const actionMeta = { actionType: 'input', placeholder: 'Enter name' }
    bot.action.set({}, actionMeta)

    await waitPromise(50)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'action',  // Actions are Blocks with type: 'action'
        key: expect.any(Number),
        data: {},
        meta: expect.objectContaining({
          actionType: 'input',
          placeholder: 'Enter name'
        })
      })
    )
  })

  test('action.set() with select type emits correct action.show event', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('action.show', listener)

    const options = [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
    const actionMeta = { actionType: 'select', options }
    bot.action.set({}, actionMeta)

    await waitPromise(50)

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'action',  // Actions are Blocks with type: 'action'
        key: expect.any(Number),
        data: {},
        meta: expect.objectContaining({
          actionType: 'select',
          options: options
        })
      })
    )
  })

  test('next() emits action.resolve event with correct data', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('action.resolve', listener)

    // Set up an action first
    const actionPromise = bot.action.set({}, { actionType: 'input' })

    await waitPromise(50)

        // Resolve it
    const resolveData = { name:'John Doe' }
    bot.next(resolveData)

    await actionPromise

    expect(listener).toHaveBeenCalledWith([resolveData])  // Raw args array
  })

  test('wait() emits bot.busy events correctly', async () => {
    const bot = createBot()
    const busyEvents = []

    bot.on('bot.busy', (event) => {
      busyEvents.push(event)
    })

    await bot.wait({ waitTime: 100 })

    expect(busyEvents).toHaveLength(2)
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })
  })

  test('wait() does NOT emit action.show (ephemeral)', async () => {
    const bot = createBot()
    const actionListener = jest.fn()

    bot.on('action.show', actionListener)

    await bot.wait({ waitTime: 50 })

    expect(actionListener).not.toHaveBeenCalled()
  })

    test('action lifecycle emits complete event sequence', async () => {
    const bot = createBot()
    const events = []

    bot.on('action.show', (data) => events.push({ type: 'action.show', data }))
    bot.on('action.resolve', (data) => events.push({ type: 'action.resolve', data }))
    bot.on('action.clear', (data) => events.push({ type: 'action.clear', data }))

    // Start action
    const actionPromise = bot.action.set({}, { actionType: 'input', placeholder: 'test' })
    await waitPromise(50)

    // Resolve action
    bot.next('user input')
    await actionPromise
    await waitPromise(50)

    // Should have action.show, action.clear, and action.resolve events
    expect(events.length).toBeGreaterThanOrEqual(2)

    const showEvent = events.find(e => e.type === 'action.show')
    const resolveEvent = events.find(e => e.type === 'action.resolve')

    expect(showEvent).toBeDefined()
    expect(showEvent.data.meta.placeholder).toBe('test') // Block is in showEvent.data
    expect(resolveEvent).toBeDefined()
    expect(resolveEvent.data[0]).toBe('user input')  // resolveEvent.data is raw args array
  })

  test('multiple message additions emit separate events', async () => {
    const bot = createBot()
    const messages = []

    bot.on('message.add', (block) => {
      messages.push(block.data)
    })

    await bot.message.add({ text: 'First message' })
    await bot.message.add({ text: 'Second message' })
    await bot.message.add({ text: 'Third message' })

    expect(messages).toHaveLength(3)
    expect(messages[0]).toEqual({ text: 'First message' })
    expect(messages[1]).toEqual({ text: 'Second message' })
    expect(messages[2]).toEqual({ text: 'Third message' })
  })

  test('event data maintains proper structure across operations', async () => {
    const bot = createBot()
    const messageEvents = []
    const actionEvents = []

    bot.on('message.add', (block) => messageEvents.push(block))
    bot.on('action.show', (action) => actionEvents.push(action))

    // Complex operation sequence
    await bot.message.add({ text: 'Welcome!' })
    bot.action.set({}, { actionType: 'select', options: [{ value: 'a', label: 'Option A' }] })
    await waitPromise(50)
    await bot.message.add({ text: 'Thank you!' })

    // Verify all events have proper Block structure
    messageEvents.forEach(block => {
      expect(block).toHaveProperty('key')
      expect(block).toHaveProperty('data')
      expect(block).toHaveProperty('type')
      expect(block).toHaveProperty('meta')
    })

    actionEvents.forEach(action => {
      expect(action).toHaveProperty('type')
      expect(action).toHaveProperty('key')
      expect(action).toHaveProperty('data')
      expect(action).toHaveProperty('meta')
      expect(action.type).toBe('action') // Actions are Blocks with type: 'action'
    })
  })
})