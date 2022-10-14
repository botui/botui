
# BotUI React Package Reference

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

Importing styles:
```js
import '@botui/react/dist/styles/default.theme.scss'
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
  - `bringIntoView`, *optional*: Scroll the action into view. Default **true**.

```jsx
<BotUIAction renderer={} />
```

### `<BotUIMessageList>`:
Renders all the messages based on the `messageType` property in the `meta`.

**Props**:

  - `renderer`, *optional*: An object containing text-to-component map to render custom messages based on `messageType` in `meta`.
  - `bringIntoView`, *optional*: Scroll the action into view. Default **true**.

```jsx
<BotUIMessageList renderer={} />
```

#### Renderers

An object containing text-to-component map to render custom messages and actions.

```ts
type component = (...args: any) => JSX.Element | null
type Renderer = Record<string, component>
```

Example `text` message renderer

```js
const renderer = {
  'text': ({ message }) => <div>{message?.data?.text}</div>
}
```

```jsx
<BotUIMessageList renderer={renderer} />
```


Checkout the [customization guide](./custom.md) on how to add/render actions and messages of your own.