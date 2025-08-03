import React, { ReactNode } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { useBotUIContext } from '../context/BotUIContext.js'

interface BotUIActionsRenderProps {
  action: IBlock | null
  resolve: (...args: any[]) => void
}

interface BotUIActionsProps {
  children: (props: BotUIActionsRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIActions({
  children,
  className,
  ...props
}: BotUIActionsProps) {
  const { action, resolve } = useBotUIContext()

  if (!action) {
    return null
  }

  return (
    <div className={className} {...props}>
      {children({ action, resolve })}
    </div>
  )
}