import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { BotUI } from '../src'
import { createBot } from 'botui'

import '../src/styles/normal.scss'
import '../src/styles/botui.scss'
import '../src/styles/themes/default.scss'

import { useBotUI } from '../src/hooks'
import { BotUIMessageList } from '../src'
import { BotUIAction } from '../src'

const myBot = createBot()
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
    myBot.wait({ waitTime: 1000 })
    // .then(() => myBot.action.set({ options: [{ label: 'Moin', value: 'moin' }, { label: 'Umer', value: 'umer' }] }, { input: 'select' }))
    // .then((data) => myBot.message.add({ text: `nice to meet you ${data.text}` }))
      .then(() => myBot.message.add({ text: 'hello, enter a repo' }))
      .then(() => myBot.action.set({ placeholder: 'repo' }, { input: 'text' }))
      .then(data => {
        fetch(`https://api.github.com/repos/${data.value}`)
          .then(res => res.json())
          .then(res => {
            myBot.next({ count: res.stargazers_count })
          })

        return myBot.wait()
      })
      .then(data => myBot.message.add({ text: `it has ${data.count} ⭐️`}))
  }, [])

  return <div>
    <BotUI bot={myBot}>
      <CustomCheck />
    </BotUI>
  </div>
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
