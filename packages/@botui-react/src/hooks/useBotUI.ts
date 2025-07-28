import { useState, useEffect, useCallback } from 'react'

// Types based on the new headless API contracts
export interface Message {
  readonly id: string
  readonly content: string | React.ReactNode
  readonly timestamp: Date
  readonly type: 'bot' | 'human'
  readonly metadata?: Record<string, unknown>
}

export interface ActionDefinition {
  readonly type: 'input' | 'select'
  readonly id: string
  readonly placeholder?: string
  readonly options?: SelectOption[]
}

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export interface ActionResult {
  readonly value: string
  readonly option?: SelectOption
}

export interface BotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: string
}

export interface Bot {
  readonly id: string
  message(content: string | React.ReactNode): Promise<void>
  action(actionDef: ActionDefinition): Promise<ActionResult>
  destroy(): void
  on(event: string, listener: (data: any) => void): void
  off(event: string, listener: (data: any) => void): void
  emit(event: string, data: any): void
}

export interface UseBotUIState {
  messages: Message[]
  action: ActionDefinition | null
  isTyping: boolean
  error: BotUIError | null
}

export interface UseBotUIActions {
  resolve: (result: ActionResult) => void
  clearError: () => void
}

export type UseBotUIReturn = UseBotUIState & UseBotUIActions

export function useBotUI(bot: Bot): UseBotUIReturn {
  const [state, setState] = useState<UseBotUIState>({
    messages: [],
    action: null,
    isTyping: false,
    error: null,
  })

  const resolve = useCallback((result: ActionResult) => {
    bot.emit('action.resolve', result)
    setState(prev => ({ ...prev, action: null }))
  }, [bot])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    const handleMessageAdd = (message: Message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
    }

    const handleActionShow = (action: ActionDefinition) => {
      setState(prev => ({ ...prev, action }))
    }

    const handleTypingSet = (isTyping: boolean) => {
      setState(prev => ({ ...prev, isTyping }))
    }

    const handleError = (error: BotUIError) => {
      setState(prev => ({ ...prev, error }))
    }

    bot.on('message.add', handleMessageAdd)
    bot.on('action.show', handleActionShow)
    bot.on('typing.set', handleTypingSet)
    bot.on('error.occurred', handleError)

    return () => {
      bot.off('message.add', handleMessageAdd)
      bot.off('action.show', handleActionShow)
      bot.off('typing.set', handleTypingSet)
      bot.off('error.occurred', handleError)
    }
  }, [bot])

  return {
    ...state,
    resolve,
    clearError,
  }
}
