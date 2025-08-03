import React, { ErrorInfo, ReactNode } from 'react'
import type { IBotuiInterface, IBlock, IBotUIError } from '../index.js'
import { BotUIProvider } from '../context/BotUIContext.js'
import { ErrorBoundary } from './ErrorBoundary.js'

interface BotUIRootProps {
  bot: IBotuiInterface
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  fallback?: ReactNode
  className?: string
  // Controlled mode props (optional)
  messages?: IBlock[]
  action?: IBlock | null
  busy?: { busy: boolean; source: 'bot' | 'human' | 'system' } | null
  error?: IBotUIError | null
  onMessagesChange?: (messages: IBlock[]) => void
  onActionChange?: (action: IBlock | null) => void
  onBusyChange?: (busy: { busy: boolean; source: 'bot' | 'human' | 'system' } | null) => void
  onErrorChange?: (error: IBotUIError | null) => void
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
  busy,
  error,
  onMessagesChange,
  onActionChange,
  onBusyChange,
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
          busy={busy}
          error={error}
          onMessagesChange={onMessagesChange}
          onActionChange={onActionChange}
          onBusyChange={onBusyChange}
          onErrorChange={onErrorChange}
        >
          {children}
        </BotUIProvider>
      </ErrorBoundary>
    </div>
  )
}