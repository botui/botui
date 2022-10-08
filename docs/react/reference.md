
# BotUI React Package

```js
import {
  useBotUI,
  useBotUIAction,
  useBotUIMessage,

  BotUI,
  BotUIAction,
  BotUIMessageList
} from '@botui/react'
```

### Example usage:

```js
import { createBot } from 'botui'
```

```js
const myBot = createBot()
```

```jsx
<BotUI bot={myBot}>
  <BotUIMessageList />
  <BotUIAction />
</BotUI>
```

## Hooks:

Following hooks are only available under the `<BotUI>` component.

- `useBotUI()`: Returns the current botui object from the React context.
- `useBotUIAction()`: Returns the current action block.
- `useBotUIMessage()`: Returns all the message blocks.

## Components:

### `<BotUI>`:
The parent component that provide all the context to childrens.

**Props**:

  - `bot`: `BotuiInterface` instance returned from `createBot()`.

```jsx
<BotUI bot={myBot}>
  {children}
</BotUI>
```

### `<BotUIAction>`:
Renders the current action based on the `actionType` property in the `meta`.

**Props**:

  - `renderer`, *optional*: An object containing text-to-component map to render custom actions based on `actionType` in `meta`.

```jsx
<BotUIAction renderer={} />
```

### `<BotUIMessageList>`:
Renders all the messages based on the `messageType` property in the `meta`.

**Props**:

  - `renderer`, *optional*: An object containing text-to-component map to render custom messages based on `messageType` in `meta`.

```jsx
<BotUIMessageList renderer={} />
```

#### Renderers

An object containing text-to-component map to render custom messages and actions.

```ts
type component = (...args: any) => JSX.Element | null
type Renderer = Record<string, component>
```

Example text renderer
```js
{
  'text': (block) => <div>{block?.data?.text}</div>
}
```

## Add a custom action

Creating a star rating action.

```jsx
const StarsAction = () => {
  const bot = useBotUI() // current instance
  const action = useBotUIAction() // get current action
  const array = new Array(action.data.total) // to make it easier to iterate

  return <div>
  {
    array.map((_, i) => <button onClick={() => {
      bot.next({ starsGiven: i + 1 }) // to resolve the action
    }}>{ i + 1 } ⭐️</button>)
  }
  </div>
}
```

```js
const actionRenderers = {
  'stars': StarsAction
}
```

```jsx
<BotUIAction renderer={actionRenderers} />
```

```js
botui.action.add(
  { total: 10 }, // data
  { actionType: 'stars' } // meta
)
.then(data => { // data is what was returned from .next()
  console.log(`You rated it ${data.starsGiven} stars!`)
})
```

## Add a custom message

Similar to adding a custom action, you can also add a custom message.

Let's create a message to render stars.

```jsx
const StarsMessage = ({ message }) => {
  const array = new Array(message.data.stars) // to make it easier to iterate

  return <div>
  { array.map(() => '⭐️') }
  </div>
}
```

```js
const messageRenderers = {
  'stars': StarsMessage
}
```

```jsx
<BotUIMessageList renderer={messageRenderers} />
```

Extending the previous `stars` action example:

```js
botui.action.add(
  { total: 10 }, // data
  { actionType: 'stars' } // meta
)
.then(data => { // data is what was returned from .next()
  return botui.message.add({ stars: data.starsGiven  }, { messageType: 'stars' })
})
```