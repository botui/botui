import { botuiControl, BOTUI_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('botui.wait', () => {
  test('does not let it resolve for the specific time', async () => {
    const botui = botuiControl()

    expect.assertions(1)
    const timeout = 1000
    const timeBefore = Date.now()

    await botui.wait({ waitTime: timeout })
    const timeAfter = Date.now()

    expect(timeAfter - timeBefore).toBeGreaterThanOrEqual(timeout)
  })

  test('waits indefinately when waitTime is missing, resolves with .next', async () => {
    const botui = botuiControl()

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

  test('triggers .onChange with meta', async () => {
    const botui = botuiControl()
    const timeout = 1000

    expect.assertions(1)

    botui.onChange(BOTUI_TYPES.ACTION, (newAction) => {
      if (newAction) {
        expect(newAction.meta).toEqual({ waitTime: timeout, waiting: true, ephemeral: true })
      }
    })

    await botui.wait({ waitTime: timeout })
    await waitPromise(500)
  })
})
