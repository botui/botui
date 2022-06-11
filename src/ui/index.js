import { useState, useEffect } from 'react'
import { BOTUI_TYPES } from '../scripts/botui.ts'

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
  const [opt, setOpt] = useState(null)

  return <div className='botui-action core-select'>
    <select onChange={e => { setOpt(e.target.value) }}>
      {
        data?.options.map(opt => <option value={opt.value}>{opt.text}</option>)
      }
    </select>

    <button onClick={() => control.next({ text: opt })}>Done</button>
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
  const [_, setRender] = useState(0)
  const [msgs, setMsgs] = useState([])
  const [action, setAction] = useState({})

  const doRender = () => setRender(Date.now())

  useEffect(() => {
    botui.onChange(BOTUI_TYPES.MESSAGE, (history) => {
      setMsgs(history)
      doRender()
    })

    botui.onChange(BOTUI_TYPES.ACTION, (action) => {
      setAction(action)
      doRender()
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
