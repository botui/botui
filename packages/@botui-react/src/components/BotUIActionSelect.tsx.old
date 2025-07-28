import { Block, BlockData } from 'botui'
import React, { useState, useMemo } from 'react'

import { CSSClasses } from '../types.js'
import { defaultTexts } from '../const.js'
import { ActionMeta } from './BotUIAction.js'
import { BotUICancelButton } from './Buttons.js'
import { useBotUI, useBotUIAction } from '../hooks/index.js'

export type ActionSelectOption = {
  value: any
  label: string
  selected?: boolean
}

export type ActionSelectData = {
  isMultiSelect?: boolean
  options: ActionSelectOption[]
}

type ActionSelectBlock = Block & {
  data: BlockData & ActionSelectData
}

export type BotUIActionSelectReturns = {
  text: string
  canceled?: boolean
  selected: ActionSelectOption
}

export type BotUIActionSelectButtonsReturns = BotUIActionSelectReturns

// TODO: Fix the action.data.isMultiSelect render
export const BotuiActionSelect = () => {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionSelectBlock
  const meta = action?.meta as ActionMeta

  const defaultSelection = Math.max(
    action?.data.options.findIndex(
      (option: ActionSelectOption) => option.selected
    ),
    0
  ) // unfound index is returned as -1
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(
    () => action?.data.options[selected],
    [selected]
  )

  return (
    <>
      <select
        autoFocus
        value={selected}
        multiple={action.data.isMultiSelect}
        onChange={(e) => {
          setSelected(parseInt(e.target.value))
        }}
      >
        {action?.data.options.map((opt: ActionSelectOption, i: number) => (
          <option key={opt.value} value={i}>
            {opt.label || opt.value}
          </option>
        ))}
      </select>

      <button
        className={CSSClasses.botui_button}
        onClick={() =>
          bot.next({
            selected: selectedObject,
            text: selectedObject.label || selectedObject.value, // to be added as an answer from human
          })
        }
      >
        {meta?.confirmButtonText ?? defaultTexts.buttons.confirm}
      </button>
      {meta?.cancelable ? (
        <BotUICancelButton
          {...meta} // to apply cancelButtonText, etc. as props.
          onClick={(cancelValue) => {
            bot.next({
              selected: null,
              ...cancelValue
            })
          }}
        />
      ) : null}
    </>
  )
}

export const BotuiActionSelectButtons = () => {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionSelectBlock
  const meta = action?.meta as ActionMeta

  return (
    <>
      {action?.data.options.map((option: ActionSelectOption, i: number) => (
        <button
          key={i}
          autoFocus={i === 0}
          className={CSSClasses.botui_button}
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
      ))}
      {meta?.cancelable ? (
        <BotUICancelButton
          {...meta} // to apply cancelButtonText, etc. as props.
          onClick={(cancelValue) => {
            bot.next({
              selected: null,
              ...cancelValue
            })
          }}
        />
      ) : null}
    </>
  )
}
