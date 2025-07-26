# Core TypeScript Guide

BotUI core is built with TypeScript and provides comprehensive type definitions for framework-agnostic, type-safe bot building.

## Installation

```bash
npm install botui
npm install --save-dev typescript
```

## Basic TypeScript Setup

### Creating a Bot

```typescript
import { createBot, BotuiInterface, BOTUI_BLOCK_TYPES } from 'botui'

const myBot: BotuiInterface = createBot()
```

### Message Types

```typescript
import { BlockData, BlockMeta } from 'botui'

// Basic text message
const textData: BlockData = {
  text: 'Hello, world!'
}

const textMeta: BlockMeta = {
  messageType: 'text'
}

await myBot.message.add(textData, textMeta)

// Image message
const imageData: BlockData = {
  src: 'https://example.com/image.jpg',
  alt: 'Description'
}

const imageMeta: BlockMeta = {
  messageType: 'image'
}

await myBot.message.add(imageData, imageMeta)
```

### Action Types

```typescript
// Input action
const inputData: BlockData = {
  placeholder: 'Enter your name',
  type: 'text'
}

const inputMeta: BlockMeta = {
  actionType: 'input'
}

const response = await myBot.action.set(inputData, inputMeta)
console.log(response.value) // TypeScript knows this exists

// Select action
const selectData: BlockData = {
  options: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]
}

const selectMeta: BlockMeta = {
  actionType: 'select'
}

const selectResponse = await myBot.action.set(selectData, selectMeta)
console.log(selectResponse.selected.value) // Type-safe access
```

## Advanced TypeScript Usage

### Custom Block Types

Define custom interfaces for your specific use cases:

```typescript
import { Block, BlockData, BlockMeta } from 'botui'

// Custom message data types
interface ChatMessageData extends BlockData {
  text: string
  author?: string
  timestamp?: string
}

interface ImageMessageData extends BlockData {
  src: string
  alt: string
  caption?: string
}

// Custom action data types
interface RatingActionData extends BlockData {
  question: string
  maxRating: number
  step?: number
}

interface FileUploadActionData extends BlockData {
  accept: string
  maxSize?: number
  multiple?: boolean
}

// Usage
const chatMessage: ChatMessageData = {
  text: 'Hello from TypeScript!',
  author: 'Bot',
  timestamp: new Date().toISOString()
}

const ratingAction: RatingActionData = {
  question: 'Rate this product',
  maxRating: 5,
  step: 1
}
```

### Custom Meta Types

```typescript
// Extend BlockMeta for custom metadata
interface CustomMessageMeta extends BlockMeta {
  messageType: 'text' | 'image' | 'chart' | 'notification'
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

interface CustomActionMeta extends BlockMeta {
  actionType: 'input' | 'select' | 'rating' | 'fileUpload'
  required?: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
  }
}

// Usage with custom types
const customMeta: CustomMessageMeta = {
  messageType: 'notification',
  priority: 'high',
  category: 'system'
}

await myBot.message.add({ text: 'System alert!' }, customMeta)
```

### Typed Plugin Development

```typescript
import { Plugin, Block, BOTUI_BLOCK_TYPES } from 'botui'

// Simple typed plugin
const uppercasePlugin: Plugin = (block: Block): Block => {
  if (block.type === BOTUI_BLOCK_TYPES.MESSAGE && block.data.text) {
    block.data.text = (block.data.text as string).toUpperCase()
  }
  return block
}

// Advanced typed plugin with custom interfaces
interface TimestampMeta extends BlockMeta {
  timestamp?: string
  timezone?: string
}

const timestampPlugin: Plugin = (block: Block): Block => {
  const meta = block.meta as TimestampMeta
  meta.timestamp = new Date().toISOString()
  meta.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return block
}

// Plugin with validation
interface ValidationOptions {
  maxLength?: number
  allowHtml?: boolean
  bannedWords?: string[]
}

const createValidationPlugin = (options: ValidationOptions): Plugin => {
  return (block: Block): Block => {
    if (block.type === BOTUI_BLOCK_TYPES.MESSAGE && block.data.text) {
      let text = block.data.text as string

      // Length validation
      if (options.maxLength && text.length > options.maxLength) {
        text = text.substring(0, options.maxLength - 3) + '...'
      }

      // HTML sanitization
      if (!options.allowHtml) {
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      // Word filtering
      if (options.bannedWords) {
        options.bannedWords.forEach(word => {
          const regex = new RegExp(word, 'gi')
          text = text.replace(regex, '*'.repeat(word.length))
        })
      }

      block.data.text = text
    }
    return block
  }
}

// Usage
const validationPlugin = createValidationPlugin({
  maxLength: 280,
  allowHtml: false,
  bannedWords: ['spam', 'inappropriate']
})

myBot.use(validationPlugin)
```

For React-specific TypeScript usage, see the [React TypeScript Guide](./react/typescript).

## Type Utilities

### Block Type Guards

```typescript
import { Block, BOTUI_BLOCK_TYPES } from 'botui'

// Type guards for better type safety
const isMessageBlock = (block: Block): block is Block => {
  return block.type === BOTUI_BLOCK_TYPES.MESSAGE
}

const isActionBlock = (block: Block): block is Block => {
  return block.type === BOTUI_BLOCK_TYPES.ACTION
}

// Usage in plugins
const typedPlugin: Plugin = (block: Block): Block => {
  if (isMessageBlock(block)) {
    // TypeScript knows this is a message block
    console.log('Processing message:', block.data.text)
  } else if (isActionBlock(block)) {
    // TypeScript knows this is an action block
    console.log('Processing action:', block.meta.actionType)
  }
  return block
}
```

### Generic Utilities

```typescript
// Generic types for custom data structures
type MessageWithData<T> = Block & {
  type: 'message'
  data: T
}

type ActionWithData<T> = Block & {
  type: 'action'
  data: T
}

// Usage
type ProductMessage = MessageWithData<{
  productId: string
  name: string
  price: number
}>

type PaymentAction = ActionWithData<{
  amount: number
  currency: string
  methods: string[]
}>
```

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

With TypeScript, you get IntelliSense, compile-time error checking, and better refactoring support, making your BotUI development experience much more robust and maintainable.