![logo](packages/botui/assets/logo.svg)

[![npm](https://img.shields.io/npm/v/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![npm](https://img.shields.io/npm/dm/botui.svg?style=flat-square)](https://www.npmjs.com/package/botui) [![Twitter Follow](https://img.shields.io/twitter/follow/moinism)](https://twitter.com/moinism)

> A JavaScript framework for creating conversational UIs.


[Main Site](https://botui.org) - [Read Docs](https://docs.botui.org) - [Examples](https://github.com/moinism/botui-examples)

## Showcase 🎇✨

We are listing all the cool projects that people are building with BotUI, [here](https://github.com/botui/botui/blob/master/Showcase.md). See others' and add yours!

🚨 **Note**

This `v2` branch has some major breaking changes. I suggest you use a specific version instead of using the `latest` tag.

## Installation

```bash
npm i botui@next @botui/react
```

### Quick look

![preview](packages/botui/assets/preview.png)

Example usage in React

```js
import ReactDOM from 'react-dom'
import { useEffect } from 'react'
import { createBot, BotUIReact } from 'botui'

const botui = createBot()
```

```html
<div id="botui-app"></div>
```

```js
const App = () => {

  useEffect(() => {
    botui.message.add({
      text: 'hello'
    })
      .then(() => botui.wait({ waitTime: 1000 }))
      .then(() => botui.message.add({ text: 'how are you?' }))
      .then(() => botui.action({
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
      .then(response => botui.message.add({
        text: `You are feeling ${response.text}!`
      }))
  }, [])

  return <div>
    <BotUIReact botui={botui} />
  </div>
}

const containerElement = document.getElementById('botui-app')

ReactDOM.render(
  <App />,
  containerElement
)
```

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/botui/botui/graphs/contributors"><img src="https://opencollective.com/botui/contributors.svg?width=890&button=false" /></a>


### License

[MIT License](https://github.com/moinism/botui/blob/master/LICENSE) - Copyrights (c) 2017-22 - Moin Uddin
