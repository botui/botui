![logo](../botui/assets/logo.svg)

[![join discussion](https://img.shields.io/badge/discussions-🤝-blueviolet?style=flat-square)](https://github.com/botui/botui/discussions) [![npm](https://img.shields.io/npm/v/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![npm downloads](https://img.shields.io/npm/dm/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![Twitter Follow](https://img.shields.io/twitter/follow/moinism)](https://twitter.com/moinism)

> Modern headless React components for building conversational UIs.

[Main Site](https://botui.org) - [Read Docs](https://docs.botui.org) - [Examples](https://github.com/moinism/botui-examples) - [🪄 Quickstart](https://github.com/botui/react-quickstart)

![botui preview](../botui/assets/botui_preview.gif)

## Installation

```bash
npm install @botui/react botui
```

## Quick Start

### Simple & Easy
```jsx
import { BotUI } from '@botui/react'
import { createBot } from 'botui'

function App() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.MessageList />
      <BotUI.Action />
    </BotUI.Root>
  )
}
```

### Headless & Flexible (maximum control)
```jsx
import { BotUI } from '@botui/react'

function App() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => (
          <div className="my-messages">
            {messages.map(msg => (
              <div key={msg.key} className="message">
                {(msg.data as any)?.text}
              </div>
            ))}
          </div>
        )}
      </BotUI.Messages>

      <BotUI.Actions>
        {({ action, resolve }) => (
          action && (
            <input
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  resolve({ value: e.currentTarget.value })
                  e.currentTarget.value = ''
                }
              }}
            />
          )
        )}
      </BotUI.Actions>
    </BotUI.Root>
  )
}
```

## Core Philosophy

### 🎯 **Headless First**
Like Headless UI, we provide the logic and leave styling to you.

### 🚀 **Easy Patterns**
Ready-to-use components for common patterns, but fully customizable.

### ⚡ **Modern React**
Built with modern React patterns - hooks, render props, context.

## API Overview

### Headless Components
```jsx
<BotUI.Root>      {/* Context provider + error boundary */}
<BotUI.Messages>  {/* Message list with render props */}
<BotUI.Actions>   {/* Action handler with render props */}
<BotUI.Virtual>   {/* Virtualized messages for performance */}
```

### Ready-to-Use Components
```jsx
<BotUI.MessageList />      {/* Styled message list */}
<BotUI.Action />           {/* Smart action handler */}
<BotUI.ActionInput />      {/* Text/file inputs */}
<BotUI.ActionSelect />     {/* Selections & choices */}
<BotUI.Wait />             {/* Loading indicators */}
```

### Message Renderers
```jsx
<BotUI.MessageText />      {/* Text messages */}
<BotUI.MessageImage />     {/* Images with lazy loading */}
<BotUI.MessageHTML />      {/* Rich HTML content */}
<BotUI.MessageMarkdown />  {/* Markdown support */}
```

## Complete Example

```jsx
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBot } from 'botui'
import { BotUI, useBotUI } from '@botui/react'

const bot = createBot()

function App() {
  const { messages, resolve } = useBotUI(bot)

  useEffect(() => {
    bot
      .wait({ waitTime: 1000 })
      .then(() => bot.message.add({ text: 'Hello! What is your name?' }))
      .then(() => bot.action.set({
        type: 'select',
        options: [
          { label: 'John', value: 'john' },
          { label: 'Jane', value: 'jane' },
        ]
      }))
      .then((data) => bot.message.add({
        text: `Nice to meet you ${data.selected.label}!`
      }))
  }, [])

  return (
    <div className="chat-app">
      {/* Option 1: Use ready-made components */}
      <BotUI.Root bot={bot}>
        <BotUI.MessageList />
        <BotUI.Action />
      </BotUI.Root>

      {/* Option 2: Use headless components for full control */}
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages }) => (
            <div className="messages">
              {messages.map(message => (
                <BotUI.Message key={message.key} message={message}>
                  {({ content, isHuman }) => (
                    <div className={isHuman ? 'human' : 'bot'}>
                      {content}
                    </div>
                  )}
                </BotUI.Message>
              ))}
            </div>
          )}
        </BotUI.Messages>

        <BotUI.Actions>
          {({ action, resolve }) => (
            action && (
              <div className="actions">
                {(action.data as any)?.type === 'select' ? (
                  <div className="options">
                    {(action.data as any)?.options?.map((option: any) => (
                      <button
                        key={option.value}
                        onClick={() => resolve({ selected: option })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    placeholder={(action.data as any)?.placeholder}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        resolve({ value: e.currentTarget.value })
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                )}
              </div>
            )
          )}
        </BotUI.Actions>
      </BotUI.Root>
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
```

## TypeScript Support

Full TypeScript support with core types:

```tsx
import type { IBlock, IBotuiInterface } from '@botui/react'

function MyMessage({ message }: { message: IBlock }) {
  return <div>{(message.data as any)?.text}</div>
}

function MyApp({ bot }: { bot: IBotuiInterface }) {
  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => messages.map(msg => (
          <MyMessage key={msg.key} message={msg} />
        ))}
      </BotUI.Messages>
    </BotUI.Root>
  )
}
```

## Styling

No default styles included - style however you want:

```css
/* Your styles */
.message { padding: 1rem; }
.human { background: blue; }
.bot { background: gray; }
```

Or use any CSS framework:

```jsx
// With Tailwind
<div className="p-4 bg-blue-500 text-white rounded-lg">
  {message.content}
</div>

// With styled-components
const Message = styled.div`
  padding: 1rem;
  background: ${props => props.isHuman ? 'blue' : 'gray'};
`
```

## Performance

- 🚀 **Virtual Scrolling**: `<BotUI.Virtual>` for large message lists
- ⚡ **Lazy Loading**: Images load when needed
- 🎯 **Tree Shaking**: Import only what you use
- 📦 **Small Bundle**: ~8KB gzipped

## Documentation

- [Complete API Reference](https://docs.botui.org/react)
- [Examples & Recipes](https://botui.org/examples)
- [TypeScript Guide](https://docs.botui.org/typescript)

### License

[MIT License](https://github.com/moinism/botui/blob/master/LICENSE) - Copyrights (c) 2017-25 - Moin Uddin