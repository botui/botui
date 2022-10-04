import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBot } from '../../botui'

import {
  BotUI,
  BotUIAction,
  BotUIMessageList
} from '../src/index.ts'

import '../src/styles/default.theme.scss'

const myBot = createBot()
const CustomCheck = () => {
  return (
    <>
      <BotUIMessageList />
      <BotUIAction />
    </>
  )
}

const App = () => {
  useEffect(() => {
    myBot
      .wait({ waitTime: 1000 })
      // .then(() =>
      //   myBot.action.set(
      //     {
      //       options: [
      //         { label: 'John', value: 'john' },
      //         { label: 'Jane', value: 'jane' },
      //       ],
      //     },
      //     { input: 'select' }
      //   )
      // )
      // .then((data) =>
      //   myBot.message.add({ text: `nice to meet you ${data.text}` })
      // )
      .then(() => myBot.message.add({ text: 'hello, enter a repo' }))
      .then(() => myBot.action.set({ placeholder: 'repo' }, { input: 'text' }))
      .then((data) => {
        fetch(`https://api.github.com/repos/${data.value}`)
          .then((res) => res.json())
          .then((res) => {
            myBot.next({ count: res.stargazers_count })
          })

        return myBot.wait()
      })
      .then((data) => myBot.message.add({ text: `it has ${data.count} ⭐️` }))
  }, [])

  return (
    <div>
      <BotUI bot={myBot}>
        <CustomCheck />
      </BotUI>
    </div>
  )
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
