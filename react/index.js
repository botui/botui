import ReactDOM from 'react-dom'
import { useEffect } from 'react'

import { botuiControl } from '../src/scripts/botui.ts'
import { BotUIReact } from '../src/ui/index.js'

import '../src/styles/normal.scss'
import '../src/styles/botui.scss'
import '../src/styles/themes/default.scss'

// import { botuiControl, BOTUI_TYPES } from '../dist/botui-module.js'

    // .use(block => {
    //   console.log('in plugin 1', block);
    //   if (block.type == BOTUI_TYPES.MESSAGE) {
    //     block.data.text = block.data?.text?.replace(/!\(([^\)]+)\)/igm, "<i>$1</i>")
    //   }

    //   return block
    // })
          // .then(() => {
      //   setTimeout(() => {
      //     console.log('gonna resolve to next')
      //     botui.next()
      //   }, 1000)

      //   return botui.wait()
      // })
      // .then(() => botui.action({ input: 'select' }, { options: [{ value: 'moin' }, { value: 'umer' }] }))
      // .then((data) => botui.message.add({}, { text: `nice to meet you ${data.text}` }))

const botui = botuiControl()
const App = () => {

  useEffect(() => {
    botui.wait({ waitTime: 1000 })
      .then(() => botui.message.add({ text: 'hello, enter a repo' }))
      .then(() => botui.action({ text: 'repo' }, { input: 'text' }))
      .then(data => {
        fetch(`https://api.github.com/repos/${data.text}`)
          .then(res => res.json())
          .then(res => {
            botui.next({ count: res.stargazers_count })
          })

        return botui.wait()
      })
      .then(data => botui.message.add({ text: `it has ${data.count} ⭐️`}))
  }, [])

  return <div>
    <BotUIReact botui={botui} />
  </div>
}

const containerElement = document.getElementById('botui')

ReactDOM.render(
  <App />,
  containerElement
)
