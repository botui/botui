import React from 'react'
import { IBotUIError } from 'botui'

interface BotUIErrorsProps {
  errors?: IBotUIError[]
  onDismiss?: (errorIndex: number) => void
  className?: string
}

export const BotUIErrors: React.FC<BotUIErrorsProps> = ({
  errors = [],
  onDismiss,
  className = ''
}) => {
  if (errors.length === 0) return null

  return (
    <div className={`botui-errors ${className}`}>
      {errors.map((error, index) => (
        <div key={index} className={`botui-error botui-error-${error.type}`}>
          <span className="botui-error-message">{error.message}</span>
          {onDismiss && (
            <button
              onClick={() => onDismiss(index)}
              className="botui-error-dismiss"
              aria-label="Dismiss error"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}