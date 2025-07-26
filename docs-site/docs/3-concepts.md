

# Core Concepts

Understanding BotUI's architecture and core concepts will help you build better conversational interfaces.

## Architecture Overview

BotUI follows a **separation of concerns** architecture with two main layers:

### Core Package (`botui`)
- **Framework-agnostic** JavaScript library
- Manages conversation state and flow
- Handles plugins and data transformation
- Provides Promise-based API for conversational flow

### UI Package (`@botui/react`)
- **React-specific** UI components
- Renders messages and actions
- Provides React hooks for state management
- Handles user interactions and visual presentation

```
┌─────────────────┐    ┌──────────────────┐
│   Core (botui)  │◄───│  React Package   │
│                 │    │  (@botui/react)  │
│ • State         │    │ • Components     │
│ • Flow Control  │    │ • Hooks          │
│ • Plugins       │    │ • Renderers      │
└─────────────────┘    └──────────────────┘
```

## Core vs UI Packages

### When to use Core only
- Building for non-React frameworks (Vue, Angular, Vanilla JS)
- Headless/API-only conversational flows
- Server-side conversation logic

### When to use Core + React
- Building React applications
- Need pre-built UI components
- Want built-in styling and animations

## Blocks: The Building Blocks

Everything in BotUI is a **Block**. There are two types:

### Message Blocks (`MESSAGE`)
- **Output** from the bot to the user
- Added to the conversation history
- Can have different `messageType`s (text, image, embed, links, custom)

### Action Blocks (`ACTION`)
- **Input requests** to the user
- Temporarily displayed until resolved
- Can have different `actionType`s (input, select, selectButtons, custom)

## Block Structure

Every block has this structure:

```typescript
interface Block {
  key: number        // Unique identifier
  type: string       // 'message' or 'action'
  meta: BlockMeta    // Configuration and metadata
  data: BlockData    // The actual content
}
```

### BlockData
Contains the actual content:

```typescript
// For messages
{ text: "Hello there!" }
{ src: "image.jpg" }
{ links: [{ text: "Link", href: "..." }] }

// For actions
{ placeholder: "Enter name" }
{ options: [{ label: "Yes", value: "yes" }] }
```

### BlockMeta
Contains configuration and metadata:

```typescript
// For messages
{ messageType: 'text' | 'image' | 'embed' | 'links' | string }
{ fromHuman: boolean }

// For actions
{ actionType: 'input' | 'select' | 'selectButtons' | string }
{ cancelable: boolean }
{ ephemeral: boolean } // Don't add to history
```

## Data Flow

BotUI follows a **Promise-based conversational flow**:

```javascript
const bot = createBot()

bot
  .message.add({ text: "What's your name?" })      // 1. Bot asks
  .then(() => bot.action.set(                      // 2. Bot requests input
    { placeholder: "Your name" },
    { actionType: 'input' }
  ))
  .then((response) => {                            // 3. User responds
    return bot.message.add({
      text: `Hello ${response.value}!`
    })
  })
  .then(() => {                                    // 4. Continue flow
    // Next part of conversation...
  })
```

### State Resolution

1. **Actions block** the conversation flow
2. User interaction calls `bot.next(data)`
3. This **resolves** the current action
4. Flow continues to the next `.then()`

## Plugin System

Plugins allow you to **transform blocks** as they flow through the system:

```javascript
// Text transformation plugin
bot.use((block) => {
  if (block.type === 'message') {
    block.data.text = block.data.text?.toUpperCase()
  }
  return block
})
```

### Plugin Execution
- Plugins run in **registration order**
- Each plugin receives output of the previous plugin
- Applied to **both** messages and actions

## React Integration

### Hooks
Access BotUI state in React components:

```jsx
function MyComponent() {
  const bot = useBotUI()           // Get bot instance
  const action = useBotUIAction()  // Get current action
  const messages = useBotUIMessage() // Get all messages
}
```

### Custom Renderers
Extend BotUI with custom components:

```jsx
const customRenderers = {
  'starRating': StarRatingAction,
  'chart': ChartMessage
}

<BotUIAction renderer={customRenderers} />
<BotUIMessageList renderer={customRenderers} />
```

## Key Principles

### 1. **Immutable Flow**
Once a block is added, the conversation flows forward. Use `.update()` if you need to modify existing blocks.

### 2. **Single Action**
Only one action can be active at a time. Actions must be resolved before the next one can be set.

### 3. **Plugin Transformation**
All blocks pass through plugins, allowing global transformations and enhancements.

### 4. **Extensible Rendering**
Both messages and actions can be extended with custom components while keeping the core logic intact.

## Next Steps

- Read the [Core API Reference](./core/1-reference.md)
- Learn about [React Components](./react/1-reference.md)
- Build [Custom Actions and Messages](./react/2-custom.md)
