import React, { ReactNode } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { CSSClasses, Renderer } from '../types.js'
import { useBotUIContext } from '../context/BotUIContext.js'
import { BotUIMessage, defaultMessageRenderers } from './BotUIMessageRenderers.js'

export interface BotUIMessageListProps {
  messages?: IBlock[]
  renderers?: Renderer
  className?: string
  messageClassName?: string
  virtualizeThreshold?: number
  children?: ReactNode | ((props: {
    messages: IBlock[];
    renderMessage: (message: IBlock, index: number) => ReactNode
  }) => ReactNode)
  [key: string]: any
}

export function BotUIMessageList({
  messages: propMessages,
  renderers = {},
  className = '',
  messageClassName = '',
  virtualizeThreshold = 100,
  children,
  ...props
}: BotUIMessageListProps) {
  const { messages: contextMessages } = useBotUIContext()
  const messages = propMessages ?? contextMessages

  // Combine default renderers with custom ones
  const allRenderers = { ...defaultMessageRenderers, ...renderers }

  const renderMessage = (message: IBlock, index: number) => (
    <BotUIMessage
      key={message.key || index}
      message={message}
      renderers={allRenderers}
      className={messageClassName}
    />
  )

  // Custom children override default rendering
  if (children) {
    return (
      <div
        className={`${CSSClasses.botui_message_list} ${className}`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        {...props}
      >
        {typeof children === 'function'
          ? children({ messages, renderMessage })
          : children
        }
      </div>
    )
  }

  // If there are many messages, suggest using virtualization
  if (messages.length > virtualizeThreshold && process.env.NODE_ENV !== 'production') {
    console.warn(
      `BotUIMessageList: ${messages.length} messages detected. ` +
      `Consider using BotUIVirtual for better performance with large message lists.`
    )
  }

  return (
    <div
      className={`${CSSClasses.botui_message_list} ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      {...props}
    >
      {messages.map(renderMessage)}
    </div>
  )
}