import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { useBotUI, UseBotUIReturn } from '../hooks/useBotUI.js'
import type { IBotuiInterface, IBlock, IBotUIError } from '../index.js'

interface BotUIContextValue extends UseBotUIReturn {
  bot: IBotuiInterface
}

interface BotUIProviderProps {
  bot: IBotuiInterface
  children: ReactNode
  // Controlled mode props (optional)
  messages?: IBlock[]
  action?: IBlock | null
  busy?: { busy: boolean; source: 'bot' | 'human' | 'system' } | null
  error?: IBotUIError | null
  onMessagesChange?: (messages: IBlock[]) => void
  onActionChange?: (action: IBlock | null) => void
  onBusyChange?: (busy: { busy: boolean; source: 'bot' | 'human' | 'system' } | null) => void
  onErrorChange?: (error: IBotUIError | null) => void
}

const BotUIContext = createContext<BotUIContextValue | null>(null)

export function BotUIProvider({
  bot,
  children,
  messages: controlledMessages,
  action: controlledAction,
  busy: controlledBusy,
  error: controlledError,
  onMessagesChange,
  onActionChange,
  onBusyChange,
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
    if (onBusyChange) onBusyChange(hookReturn.busy)
  }, [hookReturn.busy, onBusyChange])

  useEffect(() => {
    if (onErrorChange) onErrorChange(hookReturn.error)
  }, [hookReturn.error, onErrorChange])

  // Use controlled values if provided, otherwise use hook values
  const contextValue: BotUIContextValue = {
    bot,
    messages: controlledMessages ?? hookReturn.messages,
    action: controlledAction ?? hookReturn.action,
    busy: controlledBusy ?? hookReturn.busy,
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