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
2. **Compound Components**: Flexible composition like Radix UI
3. **Render Props**: Custom rendering capabilities
4. **Hook-based**: Expose hooks for custom implementations
5. **Zero Dependencies**: No CSS/styling dependencies

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
  const { messages, action, resolveAction } = useBotUI(bot)

  return (
    <div className="my-custom-design">
      {/* Completely custom implementation */}
      {messages.map(msg => <MyMessage key={msg.id} {...msg} />)}
      {action && <MyAction action={action} onResolve={resolveAction} />}
    </div>
  )
}
```

### 3. Preset Styled Components (Optional)
```typescript
// For users who want quick setup
import { BotUIStyled } from '@botui/react/styled'

<BotUIStyled.Default bot={myBot} />
<BotUIStyled.Minimal bot={myBot} />
<BotUIStyled.Modern bot={myBot} />
```

## Implementation Strategy

### Phase 1: Core Headless Components
1. **BotUI.Root** - Context provider and state management
2. **BotUI.Messages** - Message list with render props
3. **BotUI.Message** - Individual message with render props
4. **BotUI.Actions** - Action handler with render props
5. **useBotUI hook** - Direct hook access

### Phase 2: Advanced Features
1. **BotUI.MessageList.Virtual** - Virtualized long conversations
2. **BotUI.TypeIndicator** - "Bot is typing" indicator
3. **BotUI.Timestamps** - Message timing
4. **BotUI.Actions.Form** - Complex form handling

### Phase 3: Optional Styled Presets
1. **@botui/react/styled** - Pre-built styled versions
2. **@botui/react/themes** - Tailwind-based themes
3. **@botui/react/templates** - Complete chat templates

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

### Migration Bridge (Backward Compatibility)
```typescript
// Keep old API working
export const BotUIMessageList = () => (
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
      "import": "./dist/index.js"
    },
    "./styled": {
      "import": "./dist/styled/index.js"
    },
    "./themes/*": {
      "import": "./dist/themes/*.css"
    }
  },
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
4. **Better tree-shaking**: Only include used components

### For Consumers
1. **Zero config**: No build tool setup required
2. **Complete control**: Style however they want
3. **Flexibility**: Use any CSS framework or none
4. **Performance**: Only ship what they use
5. **Framework compatibility**: Works with Next.js, Vite, CRA out of the box

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