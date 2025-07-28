import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { Bot, Message, ActionDefinition, BotUIError, useBotUI, UseBotUIReturn } from '../hooks/useBotUI.js'

interface BotUIContextValue extends UseBotUIReturn {
  bot: Bot
}

interface BotUIProviderProps {
  bot: Bot
  children: ReactNode
  // Controlled mode props (optional)
  messages?: Message[]
  action?: ActionDefinition | null
  isTyping?: boolean
  error?: BotUIError | null
  onMessagesChange?: (messages: Message[]) => void
  onActionChange?: (action: ActionDefinition | null) => void
  onTypingChange?: (isTyping: boolean) => void
  onErrorChange?: (error: BotUIError | null) => void
}

const BotUIContext = createContext<BotUIContextValue | null>(null)

export function BotUIProvider({
  bot,
  children,
  messages: controlledMessages,
  action: controlledAction,
  isTyping: controlledIsTyping,
  error: controlledError,
  onMessagesChange,
  onActionChange,
  onTypingChange,
  onErrorChange,
}: BotUIProviderProps) {
  const hookReturn = useBotUI(bot)

  // If on...Change handlers are provided, this effect will sync the
  // internal state with the parent component.
  // Consumers should memoize the handlers to prevent re-render loops.
  useEffect(() => {
    if (onMessagesChange) onMessagesChange(hookReturn.messages)
  }, [hookReturn.messages, onMessagesChange])

  useEffect(() => {
    if (onActionChange) onActionChange(hookReturn.action)
  }, [hookReturn.action, onActionChange])

  useEffect(() => {
    if (onTypingChange) onTypingChange(hookReturn.isTyping)
  }, [hookReturn.isTyping, onTypingChange])

  useEffect(() => {
    if (onErrorChange) onErrorChange(hookReturn.error)
  }, [hookReturn.error, onErrorChange])

  // Use controlled values if provided, otherwise use hook values
  const contextValue: BotUIContextValue = {
    bot,
    messages: controlledMessages ?? hookReturn.messages,
    action: controlledAction ?? hookReturn.action,
    isTyping: controlledIsTyping ?? hookReturn.isTyping,
    error: controlledError ?? hookReturn.error,
    resolve: hookReturn.resolve,
    clearError: hookReturn.clearError,
  }

  return (
    <BotUIContext.Provider value={contextValue}>
      {children}
    </BotUIContext.Provider>
  )
}

export function useBotUIContext(): BotUIContextValue {
  const context = useContext(BotUIContext)
  if (!context) {
    throw new Error('useBotUIContext must be used within a BotUIProvider')
  }
  return context
}