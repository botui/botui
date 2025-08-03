import React, { useEffect, useRef } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { defaultTexts } from '../const.js'
import { useBotUIContext } from '../context/BotUIContext.js'
import { BotUIButton, BotUICancelButton } from './BotUIButton.js'

export interface BotUIActionInputProps {
  action?: IBlock | null
  className?: string
  confirmButtonText?: string
  cancelable?: boolean
  cancelButtonText?: string
  cancelMessageText?: string
  onSubmit?: (data: { text: string; value: string | FileList }) => void
  onCancel?: (data: { canceled: true; text: string }) => void
  [key: string]: any
}

export function BotUIActionInput({
  action: propAction,
  className = '',
  confirmButtonText,
  cancelable,
  cancelButtonText,
  cancelMessageText,
  onSubmit,
  onCancel,
  ...props
}: BotUIActionInputProps) {
  const { action: contextAction, resolve } = useBotUIContext()
  const action = propAction ?? contextAction
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // Auto-focus the input when it appears
    if (inputRef.current) {
      inputRef.current.focus()
    } else if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [action])

  if (!action) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const value = textAreaRef.current?.value ?? inputRef.current?.value ?? ''
    const fileValue = inputRef.current?.files

    const data = {
      text: value,
      value: fileValue ?? value,
    }

    if (onSubmit) {
      onSubmit(data)
    } else {
      resolve(data)
    }
  }

  const handleCancel = (cancelData: { canceled: true; text: string }) => {
    if (onCancel) {
      onCancel(cancelData)
    } else {
      resolve({ value: null, ...cancelData })
    }
  }

  const isTextArea = (action.data as any)?.type === 'textarea'
  const inputType = (action.data as any)?.type || 'text'

    return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {isTextArea ? (
        <textarea
          ref={textAreaRef}
          {...(action.data as any)}
          className={`botui_input botui_textarea ${(action.data as any)?.className || ''}`}
        />
      ) : (
        <input
          ref={inputRef}
          type={inputType as any}
          {...(action.data as any)}
          className={`botui_input botui_input_${inputType} ${(action.data as any)?.className || ''}`}
        />
      )}

      <BotUIButton
        text={String(confirmButtonText ?? (action.data as any)?.confirmButtonText ?? defaultTexts.buttons.confirm)}
      />

      {(cancelable ?? (action.meta as any)?.cancelable) && (
        <BotUICancelButton
          cancelButtonText={String(cancelButtonText ?? (action.data as any)?.cancelButtonText)}
          cancelMessageText={String(cancelMessageText ?? (action.data as any)?.cancelMessageText)}
          onClick={handleCancel}
        />
      )}
    </form>
  )
}