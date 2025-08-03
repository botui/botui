import { useContext } from 'react'
import { IBotUIError } from 'botui'
import { BotUIContext } from './useBotUI.js'

/**
 * Returns the current errors from the BotUI context.
 */
export const useBotUIErrors = (): IBotUIError[] => {
  const context = useContext(BotUIContext)
  if (!context) {
    throw new Error(
      `The \`useBotUIErrors\` hook must be used inside the <BotUI> component's context.`
    )
  }
  return context.errors
}