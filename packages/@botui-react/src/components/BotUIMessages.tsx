import React, { ReactNode } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { useBotUIContext } from '../context/BotUIContext.js'

interface BotUIMessagesRenderProps {
  messages: IBlock[]
}

interface BotUIMessagesProps {
  children: (props: BotUIMessagesRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIMessages({
  children,
  className,
  ...props
}: BotUIMessagesProps) {
  const { messages } = useBotUIContext()

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className={className}
      {...props}
    >
      {children({ messages })}
    </div>
  )
}