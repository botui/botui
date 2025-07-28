# BotUI React → Headless UI Migration Plan

## Current Architecture Issues

### 1. Not Truly Headless
- Components come with baked-in styling
- Limited customization via props only
- No render prop patterns
- No compound component flexibility

### 2. Installation Problems
- README missing style import instructions
- Hidden SASS dependency
- Build tool compatibility issues
- Consumers get unstyled components following docs

## Proposed Headless Architecture

### Core Principles
1. **Behavior Only**: Components manage state/logic, not styling
2. **Accessibility First**: Baked-in accessibility for all components.
   - **Announcements**: `aria-live` regions to announce new bot messages.
   - **Focus Management**: Automatic focus handling for interactive elements like action inputs.
   - **ARIA Roles**: Semantic roles (`log`, `status`, etc.) for assistive technologies.
3. **Compound Components**: Flexible composition like Radix UI
4. **Render Props**: Custom rendering capabilities
5. **Hook-based**: Expose hooks for custom implementations
6. **Zero Dependencies**: No CSS/styling dependencies

## New API Design

### 1. Compound Component Structure
```typescript
// Headless API - Consumer has full control
<BotUI.Root bot={myBot}>
  <div className="flex flex-col h-96 bg-white border rounded-lg">
    {/* Custom message area */}
    <BotUI.Messages className="flex-1 p-4 overflow-y-auto">
      {({ messages }) => (
        <div className="space-y-3">
          {messages.map((message, i) => (
            <BotUI.Message key={i} message={message}>
              {({ content, isHuman }) => (
                <div className={`p-3 rounded-lg max-w-xs ${
                  isHuman
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {content}
                </div>
              )}
            </BotUI.Message>
          ))}
        </div>
      )}
    </BotUI.Messages>

    {/* Custom action area */}
    <BotUI.Actions className="p-4 border-t">
      {({ action, resolve }) => {
        if (action?.type === 'select') {
          return (
            <div className="space-y-2">
              {action.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => resolve(option)}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )
        }

        if (action?.type === 'input') {
          return (
            <form onSubmit={(e) => {
              e.preventDefault()
              const input = e.target.elements.userInput
              resolve({ value: input.value })
              input.value = ''
            }}>
              <input
                name="userInput"
                className="w-full p-2 border rounded"
                placeholder={action.placeholder}
              />
            </form>
          )
        }

        return null
      }}
    </BotUI.Actions>
  </div>
</BotUI.Root>
```

### 2. Hook-based API for Advanced Users
```typescript
// For users who want complete control
function CustomChatBot({ bot }) {
  const { messages, action, isTyping, error, resolve } = useBotUI(bot)

  return (
    <div className="my-custom-design">
      {/* Completely custom implementation */}
      {error && <div className="error-notice">{error.message}</div>}
      {messages.map(msg => <MyMessage key={msg.id} {...msg} />)}
      {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      {action && <MyAction action={action} onResolve={resolve} />}
    </div>
  )
}
```

### 3. State Management & Data Flow
The `bot` instance passed to `<BotUI.Root>` or `useBotUI` acts as the single source of truth and is expected to be an event emitter.

- **Event-Driven**: The core `bot` engine (e.g., `@botui/core`) emits events when state changes (e.g., `message.add`, `action.show`, `typing.set`).
- **Subscription**: The `useBotUI` hook subscribes to these events and updates its internal state, triggering re-renders in the React components.
- **Decoupling**: This keeps the UI layer completely decoupled from the business logic, allowing either to be swapped out independently.

#### Event Emitter Implementation
- **Library**: Use a lightweight event emitter (mitt, tiny-emitter, or custom minimal implementation)
- **Memory Management**: Automatic cleanup on `BotUI.Root` unmount to prevent memory leaks
- **Event Types**: Strongly typed events with TypeScript for better DX

#### Controlled vs Uncontrolled State
- **Default (Uncontrolled)**: Internal state management via `useBotUI` hook
- **Controlled Mode**: Optional props to externally control state for Redux/Zustand integration
```typescript
// Controlled mode example
const { messages, action } = useSelector(state => state.chat)
const dispatch = useDispatch()

<BotUI.Root
  bot={myBot}
  messages={messages}
  action={action}
  onMessagesChange={dispatch.updateMessages}
  onActionChange={dispatch.updateAction}
>
```

### 4. Preset Styled Components (Optional)
```typescript
// For users who want quick setup
import { BotUIStyled } from '@botui/react/styled'

<BotUIStyled.Default bot={myBot} />
<BotUIStyled.Minimal bot={myBot} />
<BotUIStyled.Modern bot={myBot} />
```

## TypeScript Contracts

### Core Types
```typescript
// Bot instance interface
interface Bot extends EventEmitter {
  readonly id: string
  message(content: MessageContent): Promise<void>
  action(actionDef: ActionDefinition): Promise<ActionResult>
  destroy(): void
}

// Message types
interface Message {
  readonly id: MessageId
  readonly content: MessageContent
  readonly timestamp: Date
  readonly type: 'bot' | 'human'
  readonly metadata?: Record<string, unknown>
}

type MessageContent = string | ReactNode

// Action types
interface ActionDefinition {
  readonly type: 'input' | 'select'
  readonly id: ActionId
  readonly placeholder?: string
  readonly options?: SelectOption[]
}

interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

interface ActionResult {
  readonly value: string
  readonly option?: SelectOption
}

// Error handling
interface BotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: ActionId
}

// Event types
interface BotUIEvents {
  'message.add': Message
  'action.show': ActionDefinition
  'action.resolve': ActionResult
  'typing.set': boolean
  'error.occurred': BotUIError
}
```

## Error Handling Strategy

### Error Sources & Types
- **Network Errors**: Bot API communication failures
- **Validation Errors**: Invalid action inputs or bot configuration
- **Bot Script Errors**: Errors in bot logic/flow definition
- **Unexpected Errors**: Runtime exceptions, component errors

### Error Handling Pattern
```typescript
// Hook provides error state and recovery
const { error, clearError } = useBotUI(bot)

// Component-level error boundaries
<BotUI.Root bot={bot} onError={handleError}>
  <BotUI.ErrorBoundary fallback={CustomErrorUI}>
    <BotUI.Messages />
    <BotUI.Actions />
  </BotUI.ErrorBoundary>
</BotUI.Root>
```

## SSR & Hydration Support

### SSR-Safe Implementation
- **No Window Dependencies**: Guard all DOM access with `typeof window !== 'undefined'`
- **Hydration-Safe State**: Initialize with server-safe defaults, sync on client mount
- **Event Listener Management**: Defer event subscriptions until client-side hydration

### Next.js Compatibility
```typescript
// SSR-safe bot initialization
const bot = useMemo(() => {
  if (typeof window === 'undefined') return null
  return createBot(config)
}, [config])

if (!bot) return <div>Loading...</div> // SSR fallback
```

## Implementation Strategy

### Phase 1: Core Headless Components
1. **TypeScript Contracts** - Define and export all public interfaces
2. **Event Emitter Integration** - Lightweight, typed event system
3. **BotUI.Root** - Context provider and state management
4. **BotUI.Messages** - Message list with render props
5. **BotUI.Message** - Individual message with render props
6. **BotUI.Actions** - Action handler with render props
7. **useBotUI hook** - Direct hook access
   - **Future-Facing State**: The hook's public API should include state for common deferred features from day one to ensure a stable API and prevent breaking changes. This includes `isTyping` (for the typing indicator) and `error` (for robust error handling)
8. **Error Boundaries** - Graceful error handling components
9. **SSR Support** - Server-side rendering compatibility

### Phase 2: Advanced Features
1. **BotUI.MessageList.Virtual** - Virtualized long conversations
2. **BotUI.TypeIndicator** - "Bot is typing" indicator
3. **BotUI.Timestamps** - Message timing
4. **BotUI.Actions.Form** - Complex form handling
5. **Migration Tooling** - Codemods and migration helpers

### Phase 3: Optional Styled Presets
1. **@botui/react/styled** - Pre-built styled versions (subpath exports)
2. **@botui/react/themes** - Tailwind-based themes
3. **@botui/react/templates** - Complete chat templates
4. **Developer Tooling** - Data attributes for testing, ESLint rules

## Breaking Changes & Migration

### Current API
```typescript
import { BotUI, BotUIMessageList, BotUIAction } from '@botui/react'
import '@botui/react/default-theme' // Required but not documented!

<BotUI bot={myBot}>
  <BotUIMessageList />
  <BotUIAction />
</BotUI>
```

### New Headless API
```typescript
import { BotUI } from '@botui/react'
// No style imports needed!

<BotUI.Root bot={myBot}>
  <BotUI.Messages>
    {({ messages }) => /* custom rendering */}
  </BotUI.Messages>
  <BotUI.Actions>
    {({ action, resolve }) => /* custom rendering */}
  </BotUI.Actions>
</BotUI.Root>
```

### Migration Strategy

#### Automated Migration Tools
- **Codemod**: JSCodeshift transformer to convert old API to new compound components
- **Migration Guide**: Step-by-step guide with before/after examples
- **Type Migration**: TypeScript types upgrade automatically via module resolution

#### Migration Timeline
- **v2.0**: Old API works with deprecation warnings
- **v2.5**: Migration tools and comprehensive docs available
- **v3.0**: Old API removed, full headless-only

### Migration Bridge (Backward Compatibility)
```typescript
// Keep old API working with deprecation warnings
export const BotUIMessageList = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('BotUIMessageList is deprecated. Use BotUI.Messages instead.')
  }

  return (
    <BotUI.Messages>
      {({ messages }) => (
        <div className="botui-messages-default">
          {messages.map(msg => (
            <div key={msg.id} className="botui-message-default">
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </BotUI.Messages>
  )
}
```

## Package Structure Changes

### Current Structure
```
@botui/react/
├── dist/
│   ├── index.js (React components)
│   └── styles/ (SASS files)
```

### New Headless Structure
```
@botui/react/
├── dist/
│   ├── index.js (Headless components + hooks)
│   ├── styled/ (Optional styled versions)
│   └── themes/ (Optional Tailwind themes)
```

### Package.json Changes
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styled": {
      "import": "./dist/styled/index.js",
      "types": "./dist/styled/index.d.ts"
    },
    "./themes/*": {
      "import": "./dist/themes/*.css"
    }
  },
  "sideEffects": false,
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
    // No SASS dependencies!
  }
}
```

## Benefits of This Approach

### For Package Maintainers
1. **Smaller bundle**: No CSS included by default
2. **Framework agnostic**: Works with any styling solution
3. **Less maintenance**: No CSS edge cases to debug
4. **Better tree-shaking**: Only include used components (`sideEffects: false`)
5. **TypeScript-first**: Strong typing prevents runtime errors

### For Consumers
1. **Zero config**: No build tool setup required
2. **Complete control**: Style however they want
3. **Flexibility**: Use any CSS framework or none
4. **Performance**: Only ship what they use
5. **Framework compatibility**: Works with Next.js, Vite, CRA out of the box
6. **Error resilience**: Built-in error boundaries and recovery
7. **SSR ready**: Works with server-side rendering out of the box

## Comparison with Headless UI Libraries

### Radix UI Dialog Example
```typescript
<Dialog.Root>
  <Dialog.Trigger asChild>
    <button>Open Dialog</button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
    <Dialog.Description>Description</Dialog.Description>
    <Dialog.Close asChild>
      <button>Close</button>
    </Dialog.Close>
  </Dialog.Content>
</Dialog.Root>
```

### Our BotUI Equivalent
```typescript
<BotUI.Root bot={myBot}>
  <BotUI.Messages>
    {({ messages }) => /* custom message rendering */}
  </BotUI.Messages>
  <BotUI.Actions>
    {({ action, resolve }) => /* custom action rendering */}
  </BotUI.Actions>
</BotUI.Root>
```

Both provide:
- Complete styling control
- Accessible by default
- Compound component patterns
- Flexible composition
- Zero styling opinions