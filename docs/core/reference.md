
`botui` package currently exports the following methods, properties and types:

```js
import {
  Plugin,
  Block,
  BlockData,
  BlockMeta,

  createBot,
  BOTUI_TYPES
} from 'botui'
```

### Types:

- `Plugin`
- `Block`
- `BlockData`
- `BlockMeta`


### Methods and properties:
- `createBot(): BotuiInterface`: returns a new `BotuiInterface` instance.
- `BOTUI_TYPES`: an object of block types:


```js
{
  ACTION: 'action',
  MESSAGE: 'message',
}
```

## Interface:

A `BotuiInterface` instance has following objects and methods.

- `message`:
  - `.add(data: BlockData, meta: BlockMeta): Promise<number>`: Adds a new non-action block to the chat list. Returns its `key` to be used with `.remove()` or `.update()`.
  - `.getAll(): Promise<Block[]>`: Get all of the current blocks listed in the chat.
  - `.setAll(blocks: Block[]): Promise<Block[]>`: Load existing list of blocks.
  - `.get(key: number): Promise<Block>`: Get a single block by it's key.
  - `.remove(key: number): Promise<void>`: Remove a single block by it's key.
  - `.update(key: number, data: BlockData, meta: BlockMeta): Promise<void>`: Update a single block by it's key.
  - `.removeAll(): Promise<void>`: Removes all the blocks.
- `action`:
  - `.set(data: BlockData, meta: BlockMeta): Promise<void>`: Asks the user to perform an action. BotUI won't go further until this action is resolved by calling `.next()`
  - `.get(): Promise<Block | null>`: Returns the current action or `null` if there is none.
- `.onChange(type: BlockType, cb: CallbackFunction): BotuiInterface`: Listen to changes in the current action and messages.
- `.wait({ waitTime: <milliseconds> }): Promise<void>`: Wait does not let the next message/action resolve until `.next()` is called. When `waitTime` property is present in the meta, `.next()` is called internally with that meta.
- `.next(...args: any[]): BotuiInterface`: Resolves current action or wait command. Passed data is sent to the next `.then()`
- `.use(plugin: Plugin): BotuiInterface`: Register a plugin with this instance.


### `Plugin`:
A plugin is just a function that takes the current block and must return the block. It can change the block's meta and data in-between.

Plugin signature:
```js
(block: Block) => Block
```
Example:

The plugin below replaces `!(text)` with `<i>text</i>`

```js
const myBot = createBot()
myBotu.use(block => {
  if (block.type == BOTUI_TYPES.MESSAGE) {
    block.data.text = block.data?.text?.replace(/!\(([^\)]+)\)/igm, "<i>$1</i>")
  }
  return block
})
```