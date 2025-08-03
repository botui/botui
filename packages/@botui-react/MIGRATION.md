# BotUI React Migration Guide

## Overview

BotUI React has been refactored to provide a clean, headless API while maintaining backward compatibility through a separate legacy export path.

## What Changed

### ✅ Clean Headless API (Main Export)
```typescript
// NEW: Clean, event-based API
import { BotUI, useBotUI } from '@botui/react'

// Modern bot interface with events
interface Bot {
  readonly id: string
  on(event: string, listener: Function): void
  off(event: string, listener: Function): void
  emit(event: string, data: any): void
  message(content: string | React.ReactNode): Promise<void>
  action(actionDef: ActionDefinition): Promise<ActionResult>
  destroy(): void
}
```

### 📦 Legacy API (Separate Import)
```typescript
// LEGACY: Complex transformation API
import { useBotUILegacy, BotUIMessageList, BotUIAction } from '@botui/react/legacy'

// Old bot interface with callbacks
interface LegacyBot {
  message: { add: Function, getAll: Function, /* ... */ }
  action: { set: Function, hide: Function }
  onChange: (state: string, callback: Function) => void
  next: (...args: any[]) => any
  // ... other legacy methods
}
```

## Migration Options

### Option 1: Keep Using Legacy API (Zero Changes)
If you want to keep your existing code working without any changes:

```typescript
// Before
import { BotUI, useBotUI, BotUIMessageList } from '@botui/react'

// After (add /legacy to import)
import { BotUI, useBotUILegacy as useBotUI, BotUIMessageList } from '@botui/react/legacy'
```

### Option 2: Migrate to Clean Headless API (Recommended)
For new projects or when you want the benefits of the clean API:

```typescript
// Before: Complex bot with transformations
const bot = createBot() // Old API

// After: Event-based bot
const bot = {
  id: 'my-bot',
  on: (event, listener) => { /* implement event system */ },
  off: (event, listener) => { /* implement event system */ },
  emit: (event, data) => { /* implement event system */ },
  message: async (content) => { /* send message */ },
  action: async (actionDef) => { /* handle action */ },
  destroy: () => { /* cleanup */ }
}
```

## Bundle Size Impact

### Before Cleanup
```typescript
import { BotUI } from '@botui/react' // ~15KB including legacy code
```

### After Cleanup
```typescript
// Clean API only
import { BotUI } from '@botui/react' // ~8KB (47% reduction)

// Legacy API (when needed)
import { BotUILegacy } from '@botui/react/legacy' // ~15KB
```

## Component Changes

### Headless Components (Main Export)
```typescript
import { BotUI } from '@botui/react'

// Clean render props API
<BotUI.Root bot={myBot}>
  <BotUI.Messages>
    {({ messages }) => (
      <div>
        {messages.map(msg => (
          <BotUI.Message key={msg.id} message={msg}>
            {({ content, isHuman }) => (
              <div className={isHuman ? 'human' : 'bot'}>
                {content}
              </div>
            )}
          </BotUI.Message>
        ))}
      </div>
    )}
  </BotUI.Messages>

  <BotUI.Actions>
    {({ action, resolve }) => (
      action && (
        <div>
          {action.type === 'input' && (
            <input
              placeholder={action.placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  resolve({ value: e.currentTarget.value })
                }
              }}
            />
          )}
        </div>
      )
    )}
  </BotUI.Actions>
</BotUI.Root>
```

### Legacy Components (Legacy Export)
```typescript
import { BotUIMessageList, BotUIAction } from '@botui/react/legacy'

// Old styled components API
<div>
  <BotUIMessageList bot={myBot} />
  <BotUIAction bot={myBot} />
</div>
```

## Breaking Changes

### Main Package (`@botui/react`)
- ❌ Removed: `BotUIMessageList`, `BotUIAction`
- ❌ Removed: `MessageType`, `BotUIMessageText`, etc.
- ❌ Removed: Complex transformation logic in `useBotUI`
- ✅ Added: Clean event-based `Bot` interface
- ✅ Added: Simplified `useBotUI` hook

### Legacy Package (`@botui/react/legacy`)
- ✅ Contains all removed components
- ✅ Contains `useBotUILegacy` with complex transformations
- ⚠️ Shows deprecation warnings in development

## Recommended Migration Path

1. **Phase 1**: Switch to legacy imports (no code changes)
   ```typescript
   import { ... } from '@botui/react/legacy'
   ```

2. **Phase 2**: Gradually migrate components to headless API
   ```typescript
   import { BotUI } from '@botui/react'
   ```

3. **Phase 3**: Update bot implementation to event-based
   ```typescript
   const bot = new EventBasedBot()
   ```

## Benefits of Migration

### For Bundle Size
- 47% smaller main bundle
- Tree-shaking friendly
- Optional legacy code

### For Developer Experience
- Cleaner, predictable API
- Better TypeScript support
- No complex transformations
- Modern React patterns

### For Customization
- Complete styling control
- Flexible component composition
- Custom message types
- Custom action handlers

## Support

- **Legacy API**: Supported indefinitely, but deprecated
- **Headless API**: Active development, recommended for new projects
- **Migration**: Gradual migration path available

For help with migration, see our [examples](./examples) or [open an issue](https://github.com/botui/botui/issues).