import { useState, useEffect, useMemo } from 'react'
import { BOTUI_TYPES } from '../src/scripts/botui.ts'

const BotuiMessage = ({ data = {} }) => {
  return <div className='botui-message'>
    <div className='botui-message-content'>{data?.text}</div>
  </div>
}

const BotuiActionText = ({ data = {}, control = {} }) => {
  return <input type='text' placeholder={data?.text} onKeyUp={e => {
      if (e.key == 'Enter') {
        control.next({ text: e.target.value })
      }
    }}
  />
}

const BotuiActionSelect = ({ data = {}, control = {} }) => {
  const defaultSelection = data.options.findIndex(option => option.selected) ?? 0
  const [selected, setSelected] = useState(defaultSelection)
  const selectedObject = useMemo(() => data.options[selected], [selected])

  return <div className='botui-action core-select'>
    <select value={selected} onChange={e => { setSelected(e.target.value) }}>
      {
        data.options.map((opt, i) => <option key={opt.value} value={i}>{opt.text || opt.value}</option>)
      }
    </select>

    <button onClick={() => control.next({ selected: selectedObject, text: selectedObject.text || selectedObject.value })}>Done</button>
  </div>
}

const BOTUI_ACTIONS = {
  'text': BotuiActionText,
  'select': BotuiActionSelect,
}

function BotuiAction ({ action = {}, control = {} }) {
  const Action = BOTUI_ACTIONS[action?.meta?.input]
  return <div className='botui-actions-container'>
    {
      action
        ? action.type == BOTUI_TYPES.ACTION && Action && !action.meta?.waiting
          ? <Action data={action.data} control={control} />
          : <div>{action?.meta?.waiting ? 'wait' : action.type}</div>
        : null
    }
  </div>
}

export const BotUIReact = ({ botui = {} }) => {
  const [msgs, setMsgs] = useState([])
  const [action, setAction] = useState({})

  useEffect(() => {
    botui.onChange(BOTUI_TYPES.MESSAGE, (history) => {
      setMsgs([...history])
    })

    botui.onChange(BOTUI_TYPES.ACTION, (action) => {
      setAction({...action})
    })
  }, [])

  return <div className='botui-app-container'>
    <div className='botui-container'>
      <div className='botui-message-list'>
        {
          msgs.map((msg, i) => <BotuiMessage key={i} data={msg.data} />)
        }
      </div>

      <BotuiAction action={action} control={botui} />
    </div>
  </div>
}
