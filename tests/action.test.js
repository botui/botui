import { botuiControl, BOTUI_TYPES } from '../dist/botui'
import { expect } from '@jest/globals'
const botui = botuiControl()

describe('botui.action', () => {
  test('.action adds an action and triggers .onChange on BOTUI_TYPES.ACTION type', async () => {
    const action = {
      type: 'input',
      placeholder: 'enter your name please'
    }

    botui.onChange(BOTUI_TYPES.ACTION, (newAction) => {
      expect(newAction.meta).toEqual(action)
    })

    botui.action({}, action)
  })
})
