![logo](assets/logo.svg)

[![npm](https://img.shields.io/npm/v/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![npm](https://img.shields.io/npm/dm/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![Twitter Follow](https://img.shields.io/twitter/follow/moinism)](https://twitter.com/moinism)

> A JavaScript framework for creating conversational UIs.


[Main Site](https://botui.org) - [Read Docs](https://docs.botui.org) - [Examples](https://github.com/moinism/botui-examples)

🚨 **Note**

This `v2` branch has some major breaking changes. I suggest you use a specific version instead of using the `latest` tag.

### Quick look

![preview](assets/preview.png)

Example usage in React

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
    myBot.message.add({
      text: 'hello'
    })
      .then(() => myBot.wait({ waitTime: 1000 }))
      .then(() => myBot.message.add({ text: 'how are you?' }))
      .then(() => myBot.action({
          type: 'single-choice'
        },
        {
          options: [{
            text: 'Good',
            value: 'good'
          },
          {
            text: 'Really Good',
            value: 'really_good'
          }]
        }
      ))
      .then(response => myBot.message.add({
        text: `You are feeling ${response.text}!`
      }))
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
