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

function BotuiAction ({ action = {}, control = {} }) {
  return <div className='botui-actions-container'>
    {
      action
        ? action.type == BOTUI_TYPES.ACTION && !action.meta?.waiting
          ? action?.meta?.input == 'select'
            ? <BotuiActionSelect data={action.data} control={control} />
            : <BotuiActionText data={action.data} control={control} />
          : <div>{action?.meta?.waiting ? 'wait' : action.type}</div>
        : ''
    }
  </div>
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
      {
        msgs.map((msg, i) => <BotuiMessage key={i} data={msg.data} />)
      }

      <BotuiAction action={action} control={botui} />
    </div>
  </div>
}
