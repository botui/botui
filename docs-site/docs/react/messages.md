
# Built-in Message types

> To add your own messages, follow the [customization guide](./2-custom.md).

Currently, React package of BotUI supports the following `messageType`s:

- `text`, default type: Shows the text using the `data.text` property:

```js
botui.message.add({ text: 'hello, what is your name?' })
```

This example will ask the user to pick a date.

- `embed`: Shows an `<iframe>` using the `data.src`:

```js
botui.message.add({ src: 'the url' }, { messageType: 'embed' })
```

- `image`: Shows an `<img>` using the `data.src`:

```js
botui.message.add({ src: 'the url' }, { messageType: 'image' })
```

For both the `image` and `embed`, you can pass additional properties in the `data` to have them added as attributes to the respective tag. For example, you can add an `alt` attribute to the `img` tag as:

```js
botui.message.add({ src: 'the url', alt: 'some text for alt' }, { messageType: 'image' })
```
