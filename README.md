![logo](packages/botui/assets/logo.svg)

[![join discussion](https://img.shields.io/badge/discussions-🤝-blueviolet?style=flat-square)](https://github.com/botui/botui/discussions) [![npm](https://img.shields.io/npm/v/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![npm](https://img.shields.io/npm/dm/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![Twitter Follow](https://img.shields.io/twitter/follow/moinism)](https://twitter.com/moinism)

> A JavaScript framework for creating conversational UIs.


[Main Site](https://botui.org) - [Read Docs](https://docs.botui.org) - [Examples](https://github.com/moinism/botui-examples) - [🪄 Quickstart](https://github.com/botui/react-quickstart)

## Showcase 🎇✨

We are listing all the cool projects that people are building with BotUI, [here](https://github.com/botui/botui/blob/master/Showcase.md). See others' and add yours!

🚨 **Note**

The new version has some major breaking changes. I suggest you use a specific version instead of using the `latest` tag.

## Installation

```bash
npm i botui@next @botui/react
```

### Quick look

![preview](packages/botui/assets/botui_preview.gif)

## Installation

```bash
npm i botui@next @botui/react
```

### Example usage in React

```js
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { createBot } from 'botui'
import { BotUI, BotUIMessageList, BotUIAction, useBotUI } from '@botui/react'

const myBot = createBot()
```

```html
<div id="botui-app"></div>
```

```js
const App = () => {

  useEffect(() => {
    myBot
      .wait({ waitTime: 1000 })
      .then(() => myBot.message.add({ text: 'hello, what is your name?' }))
      .then(() => myBot.action.set(
          {
            options: [
              { label: 'John', value: 'john' },
              { label: 'Jane', value: 'jane' },
            ],
          },
          { actionType: 'select' }
      ))
      .then((data) => myBot.message.add({ text: `nice to meet you ${data.selected.label}` }))
  }, [])

  return <div>
    <BotUI bot={myBot}>
      <BotUIMessageList />
      <BotUIAction />
    </BotUI>
  </div>
}

const containerElement = document.getElementById('botui-app')
const root = createRoot(containerElement)
root.render(<App />)
```

### License

[MIT License](https://github.com/moinism/botui/blob/master/LICENSE) - Copyrights (c) 2017-22 - Moin Uddin
