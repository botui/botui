import React, { useState, useMemo } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { CSSClasses } from '../types.js'
import { defaultTexts } from '../const.js'
import { useBotUIContext } from '../context/BotUIContext.js'
import { BotUIButton, BotUICancelButton } from './BotUIButton.js'

export interface SelectOption {
  value: any
  label: string
  selected?: boolean
  disabled?: boolean
}

export interface BotUIActionSelectProps {
  action?: IBlock | null
  className?: string
  isMultiSelect?: boolean
  confirmButtonText?: string
  cancelable?: boolean
  cancelButtonText?: string
  cancelMessageText?: string
  onSubmit?: (data: { text: string; selected: SelectOption | SelectOption[] }) => void
  onCancel?: (data: { canceled: true; text: string }) => void
  [key: string]: any
}

export function BotUIActionSelect({
  action: propAction,
  className = '',
  isMultiSelect,
  confirmButtonText,
  cancelable,
  cancelButtonText,
  cancelMessageText,
  onSubmit,
  onCancel,
  ...props
}: BotUIActionSelectProps) {
  const { action: contextAction, resolve } = useBotUIContext()
  const action = propAction ?? contextAction

  const options = (action?.data as any)?.options || []
  const multiSelect = isMultiSelect ?? (action?.data as any)?.isMultiSelect ?? false

  const defaultSelection = Math.max(
    options.findIndex((option: SelectOption) => option.selected),
    0
  )

  const [selected, setSelected] = useState(
    multiSelect
      ? options.map((_: any, index: number) => options[index]?.selected ?? false)
      : defaultSelection
  )

  const selectedObject = useMemo(() => {
    if (multiSelect) {
      return options.filter((_: any, index: number) => (selected as boolean[])[index])
    }
    return options[selected as number]
  }, [selected, options, multiSelect])

  if (!action || !options.length) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedOptions = multiSelect ? selectedObject : selectedObject
    const text = multiSelect
      ? (selectedOptions as SelectOption[]).map(opt => opt.label).join(', ')
      : (selectedOptions as SelectOption)?.label || ''

    const data = {
      text,
      selected: selectedOptions,
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

  return (
    <div className={className} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="botui_select_container">
          {multiSelect ? (
            // Multi-select checkboxes
            options.map((option: SelectOption, index: number) => (
              <label key={index} className="botui_select_option botui_checkbox_option">
                <input
                  type="checkbox"
                  checked={(selected as boolean[])[index] || false}
                  disabled={option.disabled}
                  onChange={(e) => {
                    const newSelected = [...(selected as boolean[])]
                    newSelected[index] = e.target.checked
                    setSelected(newSelected)
                  }}
                />
                <span className="checkmark"></span>
                {option.label}
              </label>
            ))
          ) : (
            // Single select radio buttons or dropdown
            (action?.data as any)?.selectType === 'dropdown' ? (
              <select
                value={selected as number}
                onChange={(e) => setSelected(parseInt(e.target.value))}
                className="botui_select_dropdown"
              >
                {options.map((option: SelectOption, index: number) => (
                  <option key={index} value={index} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              options.map((option: SelectOption, index: number) => (
                <label key={index} className="botui_select_option botui_radio_option">
                  <input
                    type="radio"
                    name="botui_select"
                    checked={(selected as number) === index}
                    disabled={option.disabled}
                    onChange={() => setSelected(index)}
                  />
                  <span className="radiomark"></span>
                  {option.label}
                </label>
              ))
            )
          )}
        </div>

        <BotUIButton
          text={String(confirmButtonText ?? (action?.data as any)?.confirmButtonText ?? defaultTexts.buttons.confirm)}
        />

        {(cancelable ?? (action?.meta as any)?.cancelable) && (
          <BotUICancelButton
            cancelButtonText={String(cancelButtonText ?? (action?.data as any)?.cancelButtonText)}
            cancelMessageText={String(cancelMessageText ?? (action?.data as any)?.cancelMessageText)}
            onClick={handleCancel}
          />
        )}
      </form>
    </div>
  )
}

export interface BotUIActionSelectButtonsProps extends Omit<BotUIActionSelectProps, 'isMultiSelect'> {
  buttonClassName?: string
}

export function BotUIActionSelectButtons({
  action: propAction,
  className = '',
  buttonClassName = '',
  cancelable,
  cancelButtonText,
  cancelMessageText,
  onSubmit,
  onCancel,
  ...props
}: BotUIActionSelectButtonsProps) {
  const { action: contextAction, resolve } = useBotUIContext()
  const action = propAction ?? contextAction
  const options = (action?.data as any)?.options || []

  if (!action || !options.length) {
    return null
  }

  const handleOptionClick = (option: SelectOption, index: number) => {
    const data = {
      text: option.label,
      selected: option,
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

  return (
    <div className={`botui_select_buttons ${className}`} {...props}>
      {options.map((option: SelectOption, index: number) => (
        <BotUIButton
          key={index}
          text={option.label}
          className={`botui_select_button ${buttonClassName}`}
          disabled={option.disabled}
          type="button"
          onClick={() => handleOptionClick(option, index)}
        />
      ))}

      {(cancelable ?? (action?.meta as any)?.cancelable) && (
        <BotUICancelButton
          cancelButtonText={String(cancelButtonText ?? (action?.data as any)?.cancelButtonText)}
          cancelMessageText={String(cancelMessageText ?? (action?.data as any)?.cancelMessageText)}
          onClick={handleCancel}
        />
      )}
    </div>
  )
}