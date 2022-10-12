import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBot } from '../../botui'

import {
  useBotUI,
  useBotUIAction,

  BotUI,
  BotUIAction,
  BotUIMessageList
} from '../src/index.ts'

import '../src/styles/default.theme.scss'

function askNameBot(bot, type = 'select') {
  return bot
    .wait({ waitTime: 1000 })
    .then(() => bot.message.add({ text: 'hello, what is your name?' }))
    .then(() =>
      bot.action.set(
        {
          isMultiSelect: true,
          options: [
            { label: 'John', value: 'john' },
            { label: 'Jane', value: 'jane', selected: true },
          ],
        },
        { actionType: type }
      )
    )
    .then((data) =>
      bot.message.add({ text: `nice to meet you ${data.selected.label}` })
    )
}

function checkStarsBot(bot) {
  return bot
    .wait({ waitTime: 1000 })
    .then(() => bot.message.add({ text: 'hello, enter a repo' }))
    .then(() => bot.wait({ waitTime: 500 }))
    .then(() =>
      bot.action.set({ placeholder: 'repo' }, { actionType: 'input' })
    )
    .then((data) => {
      fetch(`https://api.github.com/repos/${data.value}`)
        .then((res) => res.json())
        .then((res) => {
          bot.next({ count: res.stargazers_count })
        })

      return bot.wait()
    })
    .then((data) => bot.message.add({ text: `it has ${data.count} ⭐️⭐️⭐️` }))
}

function customBot (bot) {
  return bot.action.set(
    { total: 10 }, // data
    { actionType: 'stars' } // meta
  )
  .then(data => { // data is what was returned from .next()
    return bot.message.add({ text: `You rated it ${data.starsGiven} stars!`  })
  })
}

const myBot = createBot()

const StarsAction = () => {
  const bot = useBotUI() // current instance
  const action = useBotUIAction() // get current action
  const array = new Array(action.data.total).fill('⭐️') // to make it easier to iterate

  return <div>
  {
    array.map((v, i) => <button key={i} onClick={() => {
      bot.next({ starsGiven: i + 1 }, { messageType: 'stars' }) // to resolve the action
    }}>{ i + 1 } { v }</button>)
  }
  </div>
}

const actionRenderers = {
  'stars': StarsAction
}

const StarsMessage = ({ message }) => {
  const stars = new Array(message.data.starsGiven).fill('⭐️') // to make it easier to iterate

  return <div>
  { stars }
  </div>
}

const messageRenderers = {
  'stars': StarsMessage
}

const MyBotUI = () => {
  return (
    <>
      <BotUIMessageList renderer={messageRenderers} />
      <BotUIAction renderer={actionRenderers} />
    </>
  )
}

const App = () => {
  useEffect(() => {
    checkStarsBot(myBot)
  }, [])

  return (
    <div>
      <BotUI bot={myBot}>
        <MyBotUI />
      </BotUI>
    </div>
  )
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
