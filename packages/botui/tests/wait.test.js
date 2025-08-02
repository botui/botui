import { createBot, BOTUI_BLOCK_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('botui.wait', () => {
  test('does not let it resolve for the specific time', async () => {
    const botui = createBot()

    expect.assertions(1)
    const timeout = 1000
    const timeBefore = Date.now()

    await botui.wait({ waitTime: timeout })
    const timeAfter = Date.now()

    expect(timeAfter - timeBefore).toBeGreaterThanOrEqual(timeout)
  })

  test('waits indefinately when waitTime is missing, resolves with .next', async () => {
    const botui = createBot()

    expect.assertions(1)
    const timeout = 1000
    const timeBefore = Date.now()

    waitPromise(timeout).then(() => {
      botui.next()
    })

    await botui.wait()
    const timeAfter = Date.now()

    expect(timeAfter - timeBefore).toBeGreaterThanOrEqual(timeout)
  })

  test('does NOT trigger action.show (wait is ephemeral)', async () => {
    const botui = createBot()
    const timeout = 100

    let actionShowFired = false

    // Should NOT trigger action.show (wait is ephemeral)
    botui.on('action.show', () => {
      actionShowFired = true
    })

    await botui.wait({ waitTime: timeout })

    expect(actionShowFired).toBe(false)
  })

  test('triggers bot.busy events correctly', async () => {
    const botui = createBot()
    const timeout = 100
    const busyEvents = []

    expect.assertions(4)

    // Collect all busy events
    botui.on('bot.busy', ({ busy, source }) => {
      busyEvents.push({ busy, source })
    })

    await botui.wait({ waitTime: timeout })

    // Should have exactly 2 events: start and end
    expect(busyEvents).toHaveLength(2)

    // First event: busy starts
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })

    // Second event: busy ends
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })

    // Verify source is always 'bot' for wait operations
    expect(busyEvents.every(event => event.source === 'bot')).toBe(true)
  })

  test('does NOT add to message history (ephemeral)', async () => {
    const botui = createBot()
    const timeout = 100

    // Get initial message count
    const initialMessages = await botui.message.getAll()
    const initialCount = initialMessages.length

    await botui.wait({ waitTime: timeout })

    // Should not have added any messages
    const finalMessages = await botui.message.getAll()
    expect(finalMessages.length).toBe(initialCount)
  })
})
