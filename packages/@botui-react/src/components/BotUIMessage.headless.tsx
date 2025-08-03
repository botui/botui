import React, { ReactNode } from 'react'
import type { IBlock } from '../../../botui/src/types.js'

interface BotUIMessageRenderProps {
  content: React.ReactNode
  isHuman: boolean
  message: IBlock
}

interface BotUIMessageProps {
  message: IBlock
  children: (props: BotUIMessageRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIMessage({
  message,
  children,
  className,
  ...props
}: BotUIMessageProps) {
  return (
    <div className={className} {...props}>
      {children({
        content: message.data.text as React.ReactNode,
        isHuman: Boolean(message.meta?.fromHuman),
        message: message,
      })}
    </div>
  )
}