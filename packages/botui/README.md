![logo](assets/logo.svg)

[![join discussion](https://img.shields.io/badge/discussions-🤝-blueviolet?style=flat-square)](https://github.com/botui/botui/discussions) [![npm](https://img.shields.io/npm/v/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![npm downloads](https://img.shields.io/npm/dm/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![Twitter Follow](https://img.shields.io/twitter/follow/moinism)](https://twitter.com/moinism)

> A JavaScript framework for creating conversational UIs.


[Main Site](https://botui.org) - [Read Docs](https://docs.botui.org) - [Examples](https://github.com/moinism/botui-examples) - [🪄 Quickstart](https://github.com/botui/react-quickstart)

🚨 **Note**

This version is using a completely different approach for building UIs. Do no use it as a drop-in replacement for the previous version. If you want to use the previous (vue-only) approach, install the `0.3.9` version: `npm i botui@0.3.9`.

### Quick look

![botui preview](assets/botui_preview.gif)

## Installation

```bash
npm i botui @botui/react
```

### Example usage in React

```js
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { createBot } from 'botui'
import { BotUI, BotUIMessageList, BotUIAction } from '@botui/react'

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
