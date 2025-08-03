import React from 'react'
import { CSSClasses } from '../types.js'

export interface BotUIWaitProps {
  className?: string
  dotCount?: number
  [key: string]: any
}

export function BotUIWait({
  className = '',
  dotCount = 3,
  ...props
}: BotUIWaitProps) {
  return (
    <div className={`${CSSClasses.botui_wait} ${className}`} {...props}>
      {Array.from({ length: dotCount }, (_, i) => (
        <i key={i} className="loading_dot"></i>
      ))}
    </div>
  )
}