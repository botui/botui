import { useState, useEffect, useCallback } from 'react'
import type {
  IBotuiInterface,
  IBlock,
  IBotUIError
} from '../../../botui/src/types.js'
import { EBotUIEvents } from '../../../botui/src/types.js'

export interface UseBotUIState {
  messages: IBlock[]
  action: IBlock | null
  error: IBotUIError | null
  busy: { busy: boolean; source: 'bot' | 'human' | 'system' } | null
}

export interface UseBotUIActions {
  resolve: (...args: any[]) => void
  clearError: () => void
}

export type UseBotUIReturn = UseBotUIState & UseBotUIActions

/**
 * Clean, modern useBotUI hook with event-based API
 * Works directly with core IBotuiInterface - no transformations
 */
export function useBotUI(bot?: IBotuiInterface): UseBotUIReturn {
  // If no bot is provided, try to get it from context
  if (!bot) {
    try {
      const { useBotUIContext } = require('../context/BotUIContext.js')
      const context = useBotUIContext()
      bot = context.bot
    } catch (error) {
      throw new Error('useBotUI must be used within a BotUIProvider or provided with a bot parameter')
    }
  }

  const currentBot = bot as IBotuiInterface
  const [state, setState] = useState<UseBotUIState>({
    messages: [],
    action: null,
    error: null,
    busy: null,
  })

  const resolve = useCallback((...args: any[]) => {
    // Call next() on the bot with provided arguments
    currentBot.next(...args)
  }, [currentBot])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    // Clean event handlers - work directly with IBlock objects
    const handleMessageAdd = (block: IBlock) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, block]
      }))
    }

    const handleActionShow = (block: IBlock) => {
      setState(prev => ({ ...prev, action: block }))
    }

    const handleActionClear = () => {
      setState(prev => ({ ...prev, action: null }))
    }

    const handleBotBusy = (payload: { busy: boolean; source: 'bot' | 'human' | 'system' }) => {
      setState(prev => ({ ...prev, busy: payload }))
    }

    const handleErrorOccurred = (error: IBotUIError) => {
      setState(prev => ({ ...prev, error }))
    }

    const handleErrorClear = () => {
      setState(prev => ({ ...prev, error: null }))
    }

    // Register event listeners using correct enum values
    currentBot.on(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
    currentBot.on(EBotUIEvents.ACTION_SHOW, handleActionShow)
    currentBot.on(EBotUIEvents.ACTION_CLEAR, handleActionClear)
    currentBot.on(EBotUIEvents.BOT_BUSY, handleBotBusy)
    currentBot.on(EBotUIEvents.ERROR_OCCURRED, handleErrorOccurred)
    currentBot.on(EBotUIEvents.ERROR_CLEAR, handleErrorClear)

    // Cleanup on unmount
    return () => {
      currentBot.off(EBotUIEvents.MESSAGE_ADD, handleMessageAdd)
      currentBot.off(EBotUIEvents.ACTION_SHOW, handleActionShow)
      currentBot.off(EBotUIEvents.ACTION_CLEAR, handleActionClear)
      currentBot.off(EBotUIEvents.BOT_BUSY, handleBotBusy)
      currentBot.off(EBotUIEvents.ERROR_OCCURRED, handleErrorOccurred)
      currentBot.off(EBotUIEvents.ERROR_CLEAR, handleErrorClear)
    }
  }, [currentBot])

  return {
    ...state,
    resolve,
    clearError,
  }
}