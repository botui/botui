import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { createBot } from 'botui'
import { BotUI } from '../src'

import '../../botui/src/styles/normal.scss'
import '../../botui/src/styles/botui.scss'
import '../../botui/src/styles/themes/default.scss'
import { useBotUI } from '../src/hooks'
import { BotUIMessageList } from '../src'
import { BotUIAction } from '../src'

const botui = createBot()
const CustomCheck = () => {
  const bot = useBotUI()
  console.log('bot', bot)

  return <>
    <BotUIMessageList />
    <BotUIAction />
  </>
}

const App = () => {

  useEffect(() => {
    botui.wait({ waitTime: 1000 })
    // .then(() => botui.action.set({ options: [{ label: 'Moin', value: 'moin' }, { label: 'Umer', value: 'umer' }] }, { input: 'select' }))
    // .then((data) => botui.message.add({ text: `nice to meet you ${data.text}` }))
      .then(() => botui.message.add({ text: 'hello, enter a repo' }))
      .then(() => botui.action.set({ placeholder: 'repo' }, { input: 'text' }))
      .then(data => {
        fetch(`https://api.github.com/repos/${data.value}`)
          .then(res => res.json())
          .then(res => {
            botui.next({ count: res.stargazers_count })
          })

        return botui.wait()
      })
      .then(data => botui.message.add({ text: `it has ${data.count} ⭐️`}))
  }, [])

  return <div>
    <BotUI bot={botui}>
      <CustomCheck />
    </BotUI>
  </div>
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
