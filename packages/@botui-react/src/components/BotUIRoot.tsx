import React, { ErrorInfo, ReactNode } from 'react'
import { Bot, Message, ActionDefinition, BotUIError } from '../hooks/useBotUI'
import { BotUIProvider } from '../context/BotUIContext'
import { ErrorBoundary } from './ErrorBoundary'

interface BotUIRootProps {
  bot: Bot
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  fallback?: ReactNode
  className?: string
  // Controlled mode props (optional)
  messages?: Message[]
  action?: ActionDefinition | null
  isTyping?: boolean
  error?: BotUIError | null
  onMessagesChange?: (messages: Message[]) => void
  onActionChange?: (action: ActionDefinition | null) => void
  onTypingChange?: (isTyping: boolean) => void
  onErrorChange?: (error: BotUIError | null) => void
  [key: string]: unknown // Allow additional props
}

export function BotUIRoot({
  bot,
  children,
  onError,
  fallback,
  className,
  messages,
  action,
  isTyping,
  error,
  onMessagesChange,
  onActionChange,
  onTypingChange,
  onErrorChange,
  ...props
}: BotUIRootProps) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat conversation"
      className={className}
      {...props}
    >
      <ErrorBoundary onError={onError} fallback={fallback}>
        <BotUIProvider
          bot={bot}
          messages={messages}
          action={action}
          isTyping={isTyping}
          error={error}
          onMessagesChange={onMessagesChange}
          onActionChange={onActionChange}
          onTypingChange={onTypingChange}
          onErrorChange={onErrorChange}
        >
          {children}
        </BotUIProvider>
      </ErrorBoundary>
    </div>
  )
}