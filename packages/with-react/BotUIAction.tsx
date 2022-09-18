import React, { useState, useMemo, KeyboardEvent } from 'react'
import { Block, BOTUI_TYPES } from 'botui'
import { useBotUI, useBotUIAction } from './hooks'

export const BotuiActionText = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  return <input type='text' placeholder={action?.data?.text} onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key == 'Enter') {
        bot.next({ text: e.target.value })
      }
    }}
  />
}

export const BotuiActionSelect = ({ data = {} }) => {
  const bot = useBotUI()
  const defaultSelection = data.options.findIndex(option => option.selected) ?? 0
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(() => data.options[selected], [selected])

  return <div className='botui-action core-select'>
    <select value={selected} onChange={e => { setSelected(e.target.value) }}>
      {
        data.options.map((opt, i) => <option key={opt.value} value={i}>{opt.text || opt.value}</option>)
      }
    </select>

    <button onClick={() => bot.next({ selected: selectedObject, text: selectedObject.text || selectedObject.value })}>Done</button>
  </div>
}

const BOTUI_ACTIONS = {
  'text': BotuiActionText,
  'select': BotuiActionSelect,
}

export type BotUIActionTypes = {
  action: Block & {
    meta: {
      input: string
    }
  }
}

export function BotUIAction () {
  const action = useBotUIAction()
  console.log('ac', action);

  const Action = BOTUI_ACTIONS[action?.meta?.input]
  return <div className='botui-actions-container'>
    {
      action
        ? action.type == BOTUI_TYPES.ACTION && Action && !action.meta?.waiting
          ? <Action data={action.data} />
          : <div>{action?.meta?.waiting ? 'wait' : action.type}</div>
        : null
    }
  </div>
}