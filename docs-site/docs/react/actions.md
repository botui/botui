
# Built-in Actions in React

> To add your own actions, follow the [customization guide](./2-custom.md).

Currently, React package of BotUI supports the following `actionType`s:

- `input`: Shows an `<input>` tag with the attributes passed in the `data`:

```js
botui.action.add({ placeholder: 'enter your name' }, { actionType: 'input' })
```

The above example will show a text input with the given placeholder.

```js
botui.action.add({ type: 'data' }, { actionType: 'input' })
```

This example will ask the user to pick a date.

- `select`: Shows a `<select>` tag with options provided in the `data`:

```js
bot.action.set(
  {
    // isMultiSelect: true,
    options: [
      { label: 'John', value: 'john' },
      { label: 'Jane', value: 'jane', selected: true },
    ],
  },
  { actionType: 'select' }
)
```

- `selectButtons`: Shows a custom component with the options shown as buttons:

```js
bot.action.set(
  {
    options: [
      { label: 'John', value: 'john' },
      { label: 'Jane', value: 'jane' },
    ],
  },
  { actionType: 'selectButtons' }
)
```