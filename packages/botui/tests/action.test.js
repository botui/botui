import { botuiControl, BOTUI_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'

const waitPromise = (time = 0) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

describe('botui.action', () => {
  test('.action adds an action and triggers .onChange on BOTUI_TYPES.ACTION type', async () => {
    const botui = botuiControl()
    const action = {
      type: 'input',
      placeholder: 'enter your name please'
    }

    botui.onChange(BOTUI_TYPES.ACTION, (newAction) => {
      expect(newAction.meta).toEqual(action)
    })

    botui.action.set({}, action)
  })

  test('.get returns the latest action', async () => {
    const botui = botuiControl()
    const action = {
      type: 'input',
      placeholder: 'enter your name please'
    }

    botui.onChange(BOTUI_TYPES.ACTION, async () => {
      const newAction = await botui.action.get()
      expect(newAction.meta).toEqual(action)
    })

    botui.action.set({}, action)
  })

  test('.action resolves only when .next is called', async () => {
    const botui = botuiControl()
    const action = {
      type: 'input',
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
})
