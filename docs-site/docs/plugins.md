# Plugins

Plugins are the powerful extensibility system in BotUI that allow you to transform blocks as they flow through the system. They enable powerful customization without modifying core functionality.

## Plugin Architecture

A plugin is a function that transforms blocks as they flow through the BotUI system. Every message and action passes through all registered plugins before being processed.

### Plugin Signature

```js
const plugin = (block: Block) => Block
```

A plugin:
- Takes a `Block` as input
- Returns a modified `Block` as output
- Can modify both `data` and `meta` properties
- Should always return the block (even if unchanged)

## Basic Plugin Examples

### Text Transformation Plugin

```js
import { BOTUI_BLOCK_TYPES } from 'botui'

const emphasisPlugin = (block) => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    // Transform !(text) to <i>text</i>
    block.data.text = block.data.text?.replace(/!\(([^\)]+)\)/g, '<i>$1</i>')

    // Transform *text* to <strong>text</strong>
    block.data.text = block.data.text?.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>')
  }
  return block
}

myBot.use(emphasisPlugin)
```

### Logging Plugin

```js
const loggingPlugin = (block) => {
  console.log(`[BotUI] ${block.type.toUpperCase()}:`, {
    key: block.key,
    data: block.data,
    meta: block.meta
  })
  return block
}

myBot.use(loggingPlugin)
```

### Content Filtering Plugin

```js
const profanityFilterPlugin = (block) => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE && block.data.text) {
    const bannedWords = ['spam', 'inappropriate']
    let text = block.data.text

    bannedWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      text = text.replace(regex, '*'.repeat(word.length))
    })

    block.data.text = text
  }
  return block
}

myBot.use(profanityFilterPlugin)
```

## Advanced Plugin Examples

### Metadata Enhancement Plugin

```js
const timestampPlugin = (block) => {
  // Add timestamp to all blocks
  block.meta.timestamp = new Date().toISOString()

  // Add additional metadata for messages
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    block.meta.messageLength = block.data.text?.length || 0
    block.meta.wordCount = block.data.text?.split(' ').length || 0
  }

  return block
}

myBot.use(timestampPlugin)
```

### Conditional Processing Plugin

```js
const markdownPlugin = (block) => {
  // Only process if markdown is enabled in meta
  if (block.meta.enableMarkdown && block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    block.data.text = block.data.text
      ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // **bold**
      ?.replace(/\*(.*?)\*/g, '<em>$1</em>')               // *italic*
      ?.replace(/`(.*?)`/g, '<code>$1</code>')             // `code`
  }
  return block
}

myBot.use(markdownPlugin)

// Usage with markdown enabled
await myBot.message.add(
  { text: 'This is **bold** and *italic* text with `code`' },
  { enableMarkdown: true }
)
```

### Data Validation Plugin

```js
const validationPlugin = (block) => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    // Ensure text exists
    if (!block.data.text) {
      block.data.text = '[Empty message]'
    }

    // Limit message length
    const maxLength = block.meta.maxLength || 1000
    if (block.data.text.length > maxLength) {
      block.data.text = block.data.text.substring(0, maxLength - 3) + '...'
      block.meta.truncated = true
    }

    // Sanitize HTML if not explicitly allowed
    if (!block.meta.allowHtml) {
      block.data.text = block.data.text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
  }
  return block
}

myBot.use(validationPlugin)
```

### Analytics Plugin

```js
const analyticsPlugin = (block) => {
  // Track message analytics
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    analytics.track('bot_message_sent', {
      messageType: block.meta.messageType || 'text',
      messageLength: block.data.text?.length || 0,
      timestamp: new Date().toISOString()
    })
  }

  // Track action analytics
  if (block.type === BOTUI_BLOCK_TYPES.ACTION) {
    analytics.track('bot_action_requested', {
      actionType: block.meta.actionType || 'input',
      hasOptions: !!block.data.options,
      optionCount: block.data.options?.length || 0,
      timestamp: new Date().toISOString()
    })
  }

  return block
}

myBot.use(analyticsPlugin)
```

### Dynamic Content Plugin

```js
const dynamicContentPlugin = (block) => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE && block.data.text) {
    // Replace variables with dynamic content
    block.data.text = block.data.text
      .replace(/\{\{username\}\}/g, getCurrentUser()?.name || 'User')
      .replace(/\{\{time\}\}/g, new Date().toLocaleTimeString())
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())

    // Process conditional content
    block.data.text = block.data.text.replace(
      /\{\{if:(.*?)\}\}(.*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        return evaluateCondition(condition) ? content : ''
      }
    )
  }
  return block
}

function evaluateCondition(condition) {
  // Simple condition evaluation - extend as needed
  switch(condition) {
    case 'authenticated': return !!getCurrentUser()
    case 'mobile': return window.innerWidth < 768
    default: return false
  }
}

myBot.use(dynamicContentPlugin)

// Usage
await myBot.message.add({
  text: 'Hello {{username}}! {{if:authenticated}}Welcome back!{{/if}}'
})
```

## Plugin Registration and Execution

### Registration

```js
const myBot = createBot()

// Method 1: Individual registration
myBot.use(plugin1)
myBot.use(plugin2)
myBot.use(plugin3)

// Method 2: Chained registration
myBot
  .use(plugin1)
  .use(plugin2)
  .use(plugin3)
```

### Execution Order

Plugins execute in **registration order**. Each plugin receives the output of the previous plugin:

```js
myBot.use(plugin1)  // Executes first
myBot.use(plugin2)  // Receives output from plugin1
myBot.use(plugin3)  // Receives output from plugin2
```

### Example Flow

```js
myBot.use(block => {
  console.log('Plugin 1:', block.data.text) // "hello"
  block.data.text = 'hola'
  return block
})

myBot.use(block => {
  console.log('Plugin 2:', block.data.text) // "hola" (modified by plugin 1)
  block.data.text = 'hi'
  return block
})

myBot.use(block => {
  console.log('Plugin 3:', block.data.text) // "hi" (modified by plugin 2)
  return block
})

await myBot.message.add({ text: 'hello' })
```

## Plugin Best Practices

1. **Always return the block** - Even if you don't modify it
2. **Check block type** - Use `BOTUI_BLOCK_TYPES` constants
3. **Be defensive** - Check if properties exist before accessing them
4. **Don't mutate unnecessarily** - Only modify what you need to change
5. **Use meaningful names** - Make your plugin's purpose clear
6. **Handle errors gracefully** - Don't let plugins break the bot flow

## Error Handling in Plugins

```js
const safePlugin = (block) => {
  try {
    // Your plugin logic here
    if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
      block.data.text = block.data.text?.toUpperCase()
    }
    return block
  } catch (error) {
    console.error('Plugin error:', error)
    // Return original block if plugin fails
    return block
  }
}

myBot.use(safePlugin)
```

## Testing Plugins

You can test plugins in isolation:

```js
import { createBlock, BOTUI_BLOCK_TYPES } from 'botui'

// Create test block
const testBlock = createBlock(
  BOTUI_BLOCK_TYPES.MESSAGE,
  { messageType: 'text' },
  { text: 'Hello !(world)!' }
)

// Test plugin
const result = emphasisPlugin(testBlock)
console.log(result.data.text) // "Hello <i>world</i>!"
```

## TypeScript Support

For TypeScript users, plugins can be strongly typed:

```typescript
import { Plugin, Block, BOTUI_BLOCK_TYPES } from 'botui'

const typedPlugin: Plugin = (block: Block): Block => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
    // TypeScript will provide autocomplete and type checking
    block.data.text = (block.data.text as string)?.toUpperCase()
  }
  return block
}
```

Plugins are one of BotUI's most powerful features, allowing you to customize every aspect of your bot's behavior while keeping your core conversation logic clean and focused.