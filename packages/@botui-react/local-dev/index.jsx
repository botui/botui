import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBot } from 'botui'

import {
  useBotUI,
  useBotUIAction,

  BotUI,
  BotUIAction,
  BotUIMessageList
} from '../dist/index.js'

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

// Original approach (still works!)
const MyBotUI = () => {
  return (
    <>
      <BotUIMessageList renderer={messageRenderers} />
      <BotUIAction renderer={actionRenderers} />
    </>
  )
}

// HeadlessUI pattern - render prop with full control
const MyHeadlessUI = () => {
  return (
    <BotUI bot={myBot}>
      {({ bot, messages, action }) => (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Custom header */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <span style={{ fontWeight: 'bold' }}>Bot Chat</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              {messages.length} messages
            </span>
          </div>

          {/* Messages with custom layout */}
          <BotUIMessageList renderer={messageRenderers}>
            {({ messages }) => (
              <div style={{
                height: '300px',
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {messages.map((message, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: message.meta?.fromHuman ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '18px',
                      backgroundColor: message.meta?.fromHuman ? '#007bff' : '#e9ecef',
                      color: message.meta?.fromHuman ? 'white' : '#495057'
                    }}>
                      {/* Simplified: Users can render whatever they want */}
                      {message.data.text || (message.data.src && <img src={message.data.src} alt="message" style={{ maxWidth: '100%' }} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BotUIMessageList>

          {/* Action with custom styling */}
          <BotUIAction renderer={actionRenderers}>
            {({ action, actionType, isWaiting, handleSubmit }) => (
              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #dee2e6'
              }}>
                {isWaiting ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6c757d'
                  }}>
                    <span>⏳</span> Bot is thinking...
                  </div>
                ) : action ? (
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6c757d',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {actionType}
                    </div>
                    {actionType === 'input' ? (
                      <form
                        style={{ display: 'flex', gap: '8px' }}
                        onSubmit={(e) => {
                          e.preventDefault()
                          const input = e.target.querySelector('input')
                          handleSubmit({ text: input.value, value: input.value })
                          input.value = ''
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Type your message..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '20px',
                            outline: 'none'
                          }}
                          autoFocus
                        />
                        <button
                          type="submit"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                          }}
                        >
                          Send
                        </button>
                      </form>
                    ) : (
                      <div>Custom handling for {actionType}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    Waiting for action...
                  </div>
                )}
              </div>
            )}
          </BotUIAction>
        </div>
      )}
    </BotUI>
  )
}

const App = () => {
  const [mode, setMode] = React.useState('headless')

  useEffect(() => {
    checkStarsBot(myBot)
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h2>🎨 @botui-react HeadlessUI Pattern</h2>
        <p>Clean render props just like HeadlessUI!</p>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMode('original')}
            style={{
              marginRight: '8px',
              padding: '8px 16px',
              border: mode === 'original' ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: mode === 'original' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Original Components
          </button>
          <button
            onClick={() => setMode('headless')}
            style={{
              padding: '8px 16px',
              border: mode === 'headless' ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: mode === 'headless' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            HeadlessUI Pattern
          </button>
        </div>
      </div>

      {mode === 'original' ? (
        <BotUI bot={myBot}>
          <MyBotUI />
        </BotUI>
      ) : (
        <MyHeadlessUI />
      )}
    </div>
  )
}

const containerElement = document.getElementById('botui')
const root = createRoot(containerElement)
root.render(<App />)
