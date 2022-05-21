import { useState, useEffect } from 'react'
import { BOTUI_TYPES } from '../scripts/botui.ts'

const BotuiMessage = ({ data = {} }) => {
  return <div>{data?.text}</div>
}

const BotuiActionText = ({ data = {}, control = {} }) => {
  return <input type='text' placeholder={data?.text} onKeyUp={e => {
      if (e.key == 'Enter') {
        control.next({ text: e.target.value })
      }
    }}
  />
}

function handleAction (action, control) {
  if (action?.meta?.input == 'select') {
    return <BotuiActionSelect data={action.data} control={control} />
  }

  return <BotuiActionText data={action.data} control={control} />
}

const BotuiActionSelect = ({ data = {}, control = {} }) => {
  const [opt, setOpt] = useState(null)

  return <div>
    <select onChange={e => { setOpt(e.target.value) }}>
      {
        data?.options.map(opt => <option value={opt.value}>{opt.value}</option>)
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

  return <div>
    <div className='msg-list'>
      {
        msgs.map((msg, i) => <BotuiMessage key={i} data={msg.data} />)
      }
    </div>
    <div>
      {
        action
          ? action.type == BOTUI_TYPES.ACTION && !action.meta?.waiting
            ? handleAction(action, botui)
            : <div>{action?.meta?.waiting ? 'wait' : action.type}</div>
          : ''
      }
    </div>
  </div>
}
