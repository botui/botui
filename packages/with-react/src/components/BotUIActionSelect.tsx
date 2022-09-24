import { Block, BlockData } from 'botui'
import React, { useState, useMemo } from 'react'
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

export const BotuiActionSelect = () => {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionSelectBlock

  const defaultSelection =
    Math.max(action?.data.options.findIndex((option) => option.selected), 0) // unfound index is returned as -1
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(
    () => action?.data.options[selected],
    [selected]
  )

  return (
    <div className="botui-action core-select">
      <select
        value={selected}
        multiple={action.data.isMultiSelect}
        onChange={(e) => {
          setSelected(parseInt(e.target.value))
        }}
      >
        {action?.data.options.map((opt, i) => (
          <option className='core-select-option' key={opt.value} value={i}>
            {opt.label || opt.value}
          </option>
        ))}
      </select>

      <button
        className='botui-button-next'
        onClick={() =>
          bot.next({
            selected: selectedObject,
            text: selectedObject.label || selectedObject.value, // to be added as a message
          })
        }
      >
        Done
      </button>
    </div>
  )
}
