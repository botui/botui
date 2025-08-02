import { createBot, BOTUI_BLOCK_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('botui.action', () => {
  test('.action adds an action and triggers action.show event', async () => {
    const botui = createBot()
    const action = {
      actionType: 'input',
      placeholder: 'enter your name please'
    }

    botui.on('action.show', (actionBlock) => {
      expect(actionBlock.type).toBe('action')  // Actions are Blocks with type: 'action'
      expect(actionBlock.meta.actionType).toBe('input')  // actionType in meta
      expect(actionBlock.meta.placeholder).toBe('enter your name please')  // placeholder in meta
    })

    botui.action.set({}, action)
  })

  test('.get returns the latest action', async () => {
    const botui = createBot()
    const action = {
      actionType: 'input',
      placeholder: 'enter your name please'
    }

    botui.on('action.show', async () => {
      const newAction = await botui.action.get()
      expect(newAction.meta).toEqual(action)
    })

    botui.action.set({}, action)
  })

  test('.action resolves only when .next is called', async () => {
    const botui = createBot()
    const action = {
      actionType: 'input',
      placeholder: 'enter your name please'
    }

    expect.assertions(1)

    const nextData = { name: 'moin' }
    botui.action.set({}, action).then(response => {
      expect(response).toEqual(nextData)
    })

    await waitPromise(1000)
    botui.next(nextData)
  })

  test('action.get() returns null when no action is set', async () => {
    const botui = createBot()

    const result = await botui.action.get()
    expect(result).toBeNull()
  })

  test('action.get() returns current action when action is set', async () => {
    const botui = createBot()
    const actionMeta = { actionType: 'input', placeholder: 'test' }

    botui.action.set({}, actionMeta)
    await waitPromise(50)

    const result = await botui.action.get()
    expect(result).not.toBeNull()
    expect(result.meta).toEqual(expect.objectContaining(actionMeta))
  })

  test('multiple actions in sequence work correctly', async () => {
    const botui = createBot()

    // First action
    const action1Promise = botui.action.set({}, { actionType: 'input', placeholder: 'First' })
    await waitPromise(50)
    botui.next('first response')
    const result1 = await action1Promise

    // Second action
    const action2Promise = botui.action.set({}, { actionType: 'select', placeholder: 'Second' })
    await waitPromise(50)
    botui.next('second response')
    const result2 = await action2Promise

    expect(result1).toBe('first response')
    expect(result2).toBe('second response')
  })

  test('action with select options handles selection correctly', async () => {
    const botui = createBot()
    const options = [
      { value: 'option1', label: 'First Option' },
      { value: 'option2', label: 'Second Option' }
    ]

    const actionPromise = botui.action.set({}, {
      actionType: 'select',
      options: options
    })

    await waitPromise(50)

    // Resolve with selected option
    const selectedOption = options[1]
    botui.next('option2', selectedOption)

    const result = await actionPromise
    expect(result).toBe('option2')
  })

  test('ephemeral action does not add to message history', async () => {
    const botui = createBot()

    const initialMessages = await botui.message.getAll()
    const initialCount = initialMessages.length

    // Create ephemeral action
    const actionPromise = botui.action.set({}, {
      actionType: 'input',
      ephemeral: true
    })

    await waitPromise(50)
    botui.next('ephemeral response')
    await actionPromise

    const finalMessages = await botui.message.getAll()
    expect(finalMessages.length).toBe(initialCount)
  })

  test('non-ephemeral action adds response to message history', async () => {
    const botui = createBot()

    const initialMessages = await botui.message.getAll()
    const initialCount = initialMessages.length

    // Create regular action
    const actionPromise = botui.action.set({}, {
      actionType: 'input',
      placeholder: 'regular action'
    })

    await waitPromise(50)
    botui.next('regular response')
    await actionPromise
    await waitPromise(50)

    const finalMessages = await botui.message.getAll()
    expect(finalMessages.length).toBe(initialCount + 1)
  })

  test('action metadata is preserved correctly', async () => {
    const botui = createBot()
    const customMeta = {
      actionType: 'input',
      placeholder: 'Custom placeholder',
      customField: 'custom value',
      timeout: 5000
    }

    botui.action.set({}, customMeta)
    await waitPromise(50)

    const action = await botui.action.get()
    expect(action.meta).toEqual(expect.objectContaining(customMeta))
  })

  test('next() with complex data structures works correctly', async () => {
    const botui = createBot()

    const actionPromise = botui.action.set({}, { actionType: 'input' })
    await waitPromise(50)

    const complexData = {
      user: { name: 'John', age: 30 },
      preferences: ['option1', 'option2'],
      timestamp: new Date(),
      metadata: { source: 'test' }
    }

    botui.next(complexData)
    const result = await actionPromise

    expect(result).toEqual(complexData)
  })
})
