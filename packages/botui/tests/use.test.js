import { botuiControl, BOTUI_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('botui.use', () => {
  test('adds a preprocessor method', async () => {
    const botui = botuiControl()
    const testBlock = {
      text: 'hello'
    }

    botui.use(block => {
      expect(block.data).toEqual(testBlock)
      return block
    })

    await botui.message.add(testBlock)
    await waitPromise(500)
  })

  test('processed block is sent to next plugin', async () => {
    const botui = botuiControl()
    const testBlock = {
      text: 'hello'
    }
    const processedBlock1 = {
      text: 'hola'
    }
    const processedBlock2 = {
      text: 'hi'
    }

    botui.use(block => {
      block.data = processedBlock1
      return block
    })
    botui.use(block => {
      expect(block.data).toEqual(processedBlock1)
      block.data = processedBlock2
      return block
    })
    botui.use(block => {
      expect(block.data).toEqual(processedBlock2)
      return block
    })

    await botui.message.add(testBlock)
    await waitPromise(500)
  })
})
