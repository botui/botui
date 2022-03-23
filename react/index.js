import ReactDOM from 'react-dom'
import { useState, useEffect } from 'react'

const botui = (() => {
  const history = []
  let resolver = null

  let callback = () => {}
  const doResolve = (...args) => {
    resolver(...args)
    callback(history)
  }

  const TYPES = {
    WAIT: 'wait',
    INPUT: 'input',
    OUTPUT: 'output',
  }

  const msg = {
    add: (type = '', data = {}) => {
      history.push({
        type: type,
        data: data
      })

      callback(history)
    }
  }

  return {
    output: (text = '') => {
      return new Promise((resolve) => {
        resolver = resolve
        msg.add(TYPES.OUTPUT, {
          text: text
        })
        doResolve()
      })
    },
    wait: (time = 0) => {
      return new Promise((resolve) => {
        resolver = resolve
        msg.add(TYPES.WAIT)
        setTimeout(doResolve, time)
      })
    },
    input: (text = '') => {
      return new Promise((resolve) => {
        resolver = resolve
        msg.add(TYPES.INPUT, {
          text: text
        })
      })
    },
    onCallback: (cb = () => {}) => {
      callback = cb
    },
    next: (...args) => {
      doResolve(...args)
    }
  }
})()

const OutputText = (data = {}) => {
  return <div>{data?.text}</div>
}

const InputText = (data = {}, control = {}) => {
  // console.log('c', control)

  return <input type='text' placeholder={data?.text} onKeyUp={e => {
    if (e.key == 'Enter') {
      botui.next(e.target.value)
      botui.output(e.target.value)
    }
  }}/>
}

const App = () => {
  const [_, setRender] = useState(0)
  const [msgs, setMsgs] = useState([])

  const doRender = () => setRender(Date.now())

  useEffect(() => {
    botui.onCallback(history => {
      setMsgs(history)
      doRender()
    })

    botui.wait(4000)
    .then(() => botui.output('hello'))
    .then(() => botui.wait(2000))
    .then(() => botui.input('how are you?'))
  }, [])

  return <div>
    {msgs.map((msg, i) => {
      console.log(i, msg.type)

      if (msg.type == 'input') return <InputText key={i} data={msg.data} control={botui} />
      else if (msg.type == 'output') return <OutputText key={i} data={msg.data} />
      return <div>wait</div>
    })}
  </div>
}

const containerElement = document.getElementById('botui')

ReactDOM.render(
  <App />,
  containerElement
)
