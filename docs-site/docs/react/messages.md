# Built-in Message types

> To add your own messages, follow the [customization guide](./2-custom.md).

Currently, React package of BotUI supports the following `messageType`s:

## `text`

Default type: Shows the text using the `data.text` property:

```js
botui.message.add({ text: 'hello, what is your name?' })
```

## `embed`

Shows an `<iframe>` using the `data.src`:

```js
botui.message.add({ src: 'the url' }, { messageType: 'embed' })
```

## `image`

Shows an `<img>` using the `data.src`:

```js
botui.message.add({ src: 'the url' }, { messageType: 'image' })
```

For both the `image` and `embed`, you can pass additional properties in the `data` to have them added as attributes to the respective tag. For example, you can add an `alt` attribute to the `img` tag as:

```js
botui.message.add(
  { src: 'the url', alt: 'some text for alt' },
  { messageType: 'image' }
)
```

## `links`

Shows a list of `<a>` tags:

```js
botui.message.add(
  {
    links: [
      {
        text: 'the url',
        href: 'https://example.com',
        /* any other <a> tag attributes you want to add. e.g:
  target: 'blank'
   */
      },
      {
        text: 'another url',
        href: 'https://example.com',
      },
    ],
  },
  { messageType: 'links' }
)
```
