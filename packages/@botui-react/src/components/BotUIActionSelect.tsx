import { Block, BlockData } from 'botui'
import React, { useState, useMemo } from 'react'

import { BringIntoView, SlideFade } from './Utils'
import { CSSClasses } from '../types'
import { useBotUI, useBotUIAction } from '../hooks'

export type ActionSelectOption = {
  value: any
  label: string
  selected: boolean
}

export type ActionSelectData = {
  isMultiSelect?: boolean
  options: ActionSelectOption[]
}

type ActionSelectBlock = Block & {
  data: BlockData & ActionSelectData
}

// TODO: Fix the action.data.isMultiSelect render
export const BotuiActionSelect = () => {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionSelectBlock

  const defaultSelection =
    Math.max(action?.data.options.findIndex((option: ActionSelectOption) => option.selected), 0) // unfound index is returned as -1
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(
    () => action?.data.options[selected],
    [selected]
  )

  return (
    <SlideFade>
      <div className={CSSClasses.botui_action}>
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
          Done
        </button>
      </div>
    </SlideFade>
  )
}

export const BotuiActionSelectButtons = () => {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionSelectBlock

  return (
    <SlideFade>
      <BringIntoView>
        <div>
          {action?.data.options.map((option: ActionSelectOption, i: number) => (
            <button
              key={i}
              autoFocus={i === 0}
              className={CSSClasses.botui_button}
              onClick={() => setTimeout(() => bot.next({
                selected: option,
                text: option.label || option.value, // to be added as an answer from human
              }), 70)
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </BringIntoView>
    </SlideFade>
  )
}