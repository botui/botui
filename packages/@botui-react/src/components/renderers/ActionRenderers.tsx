import React, { useEffect, useRef, useState, useMemo } from 'react'
import { EBotUIEvents, TBlockData } from 'botui'

import { ActionRenderer, ActionBlock } from '../BotUIAction.js'
import { defaultTexts } from '../../const.js'
import { useBotUI } from '../../hooks/index.js'

// Button components moved from Buttons.tsx
export type BotUICancelButtonTypes = {
  cancelButtonText?: string
  cancelMessageText?: string
  onClick?: (args?: any) => void
}

export type BotUIButtonTypes = {
  text: string
  className?: string
  onClick?: (args?: any) => void
}

export function BotUIButton(props: BotUIButtonTypes) {
  return (
    <button
      onClick={(e) => props?.onClick?.(e)}
      className={props?.className ?? ''}
    >
      {props?.text}
    </button>
  )
}

export function BotUICancelButton(props: BotUICancelButtonTypes) {
  return (
    <BotUIButton
      className="cancel"
      text={props?.cancelButtonText ?? defaultTexts.buttons.cancel}
      onClick={(e) => {
        e.preventDefault()
        props?.onClick?.({
          canceled: true,
          text: props?.cancelMessageText ?? defaultTexts.messages.cancel,
        })
      }}
    />
  )
}

/**
 * Built-in wait renderer
 */
export const BuiltInWaitRenderer: ActionRenderer = () => {
  return <>Waiting...</>
}

/**
 * Built-in text input renderer
 */
export const BuiltInTextRenderer: ActionRenderer = ({ action }) => {
  const bot = useBotUI()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    inputRef?.current?.focus?.()
    textAreaRef?.current?.focus?.()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Emit human busy event to indicate user interaction
    bot.emit(EBotUIEvents.BOT_BUSY, { busy: true, source: 'human' })

    const value = textAreaRef?.current?.value ?? inputRef?.current?.value
    bot.next({
      text: value,
      value: inputRef?.current?.files ?? value,
    })

    // Clear busy state immediately after next() since the action is complete
    setTimeout(() => {
      bot.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'human' })
    }, 50)
  }

  return (
    <form onSubmit={handleSubmit}>
      {action?.data?.type === 'textarea' ? (
        <textarea ref={textAreaRef} {...action?.data}></textarea>
      ) : (
        <input type="text" ref={inputRef} {...action?.data} />
      )}
      <BotUIButton
        text={action?.meta?.confirmButtonText ?? defaultTexts.buttons.confirm}
      />

      {action?.meta?.cancelable ? (
        <BotUICancelButton
          {...action?.meta}
          onClick={(cancelValue) => {
            bot.next({
              value: null,
              ...cancelValue,
            })
          }}
        />
      ) : null}
    </form>
  )
}

export type ActionSelectOption = {
  value: any
  label: string
  selected?: boolean
}

export type ActionSelectData = {
  isMultiSelect?: boolean
  options: ActionSelectOption[]
}

export type BotUIActionSelectReturns = {
  text: string
  canceled?: boolean
  selected: ActionSelectOption
}

export type BotUIActionSelectButtonsReturns = BotUIActionSelectReturns

type ActionSelectBlock = ActionBlock & {
  data: TBlockData & ActionSelectData
}

/**
 * Built-in select dropdown renderer
 */
export const BuiltInSelectRenderer: ActionRenderer = ({ action }) => {
  const bot = useBotUI()
  const selectAction = action as ActionSelectBlock

  const defaultSelection = Math.max(
    selectAction?.data.options.findIndex(
      (option: ActionSelectOption) => option.selected
    ),
    0
  ) // unfound index is returned as -1
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(
    () => selectAction?.data.options[selected],
    [selected, selectAction?.data.options]
  )

  const handleSelectionChange = (newSelectedIndex: number) => {
    // Emit human busy event to indicate user interaction
    bot.emit(EBotUIEvents.BOT_BUSY, { busy: true, source: 'human' })
    setSelected(newSelectedIndex)

    // Clear busy state after a brief moment to indicate interaction is complete
    setTimeout(() => {
      bot.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'human' })
    }, 100)
  }

  return (
    <>
      <select
        autoFocus
        value={selected}
        multiple={selectAction.data.isMultiSelect}
        onChange={(e) => {
          handleSelectionChange(parseInt(e.target.value))
        }}
      >
        {selectAction?.data.options.map(
          (opt: ActionSelectOption, i: number) => (
            <option key={opt.value} value={i}>
              {opt.label || opt.value}
            </option>
          )
        )}
      </select>

      <button
        onClick={() =>
          bot.next({
            selected: selectedObject,
            text: selectedObject.label || selectedObject.value, // to be added as an answer from human
          })
        }
      >
        {selectAction?.meta?.confirmButtonText ?? defaultTexts.buttons.confirm}
      </button>
      {selectAction?.meta?.cancelable ? (
        <BotUICancelButton
          {...selectAction?.meta} // to apply cancelButtonText, etc. as props.
          onClick={(cancelValue) => {
            bot.next({
              selected: null,
              ...cancelValue,
            })
          }}
        />
      ) : null}
    </>
  )
}

/**
 * Built-in select buttons renderer
 */
export const BuiltInSelectButtonsRenderer: ActionRenderer = ({ action }) => {
  const bot = useBotUI()
  const selectAction = action as ActionSelectBlock

  return (
    <>
      {selectAction?.data.options.map(
        (option: ActionSelectOption, i: number) => (
          <button
            key={i}
            autoFocus={i === 0}
            onClick={() =>
              setTimeout(
                () =>
                  bot.next({
                    selected: option,
                    text: option.label || option.value, // to be added as an answer from human
                  }),
                70
              )
            }
          >
            {option.label}
          </button>
        )
      )}
      {selectAction?.meta?.cancelable ? (
        <BotUICancelButton
          {...selectAction?.meta} // to apply cancelButtonText, etc. as props.
          onClick={(cancelValue) => {
            bot.next({
              selected: null,
              ...cancelValue,
            })
          }}
        />
      ) : null}
    </>
  )
}

/**
 * Default built-in action renderers map
 */
export const builtInActionRenderers = {
  wait: BuiltInWaitRenderer,
  input: BuiltInTextRenderer,
  select: BuiltInSelectRenderer,
  selectButtons: BuiltInSelectButtonsRenderer,
}
