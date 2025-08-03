# Error Handling in @botui-react

This package provides comprehensive error handling for BotUI React applications at multiple levels.

## Error Types Handled

1. **React Component Errors** - Caught by Error Boundaries
2. **Bot Errors** - Emitted by the core bot (`EBotUIEvents.ERROR_OCCURRED`)
3. **Stream Errors** - Streaming-specific errors (`EBotUIEvents.STREAM_ERROR`)

## Components

### BotUIErrorBoundary

Wraps components to catch React errors and display fallback UI.

```tsx
import { BotUIErrorBoundary } from '@botui-react'

<BotUIErrorBoundary
  level="ui" // 'ui' | 'message' | 'action'
  onError={(error, errorInfo) => {
    console.error('Error caught:', error)
  }}
  fallback={(error) => (
    <div>Custom error display: {error.message}</div>
  )}
>
  <YourComponent />
</BotUIErrorBoundary>
```

### BotUIErrors

Displays bot errors from the context.

```tsx
import { BotUIErrors, useBotUIErrors } from '@botui-react'

// Using the component
<BotUIErrors
  onDismiss={(index) => {
    // Handle error dismissal
    if (index === errors.length - 1) {
      bot.emit(EBotUIEvents.ERROR_CLEAR, undefined)
    }
  }}
/>

// Or using the hook
const errors = useBotUIErrors()
```

### BotUIStreamErrors

Handles streaming-specific errors with auto-hide functionality.

```tsx
import { BotUIStreamErrors } from '@botui-react'

<BotUIStreamErrors
  maxErrors={5}
  autoHide={true}
  autoHideDelay={5000}
/>
```

## Usage Examples

### Basic Setup

```tsx
import { BotUI, BotUIErrors, BotUIMessageList, BotUIAction } from '@botui-react'

<BotUI bot={bot}>
  <BotUIErrors />
  <BotUIMessageList />
  <BotUIAction />
</BotUI>
```

### Custom Error Handling

```tsx
<BotUI bot={bot}>
  {({ bot, messages, action, errors }) => (
    <>
      {errors?.length > 0 && (
        <div className="custom-error-display">
          {errors.map((error, i) => (
            <div key={i} className={`error-${error.type}`}>
              {error.message}
            </div>
          ))}
        </div>
      )}
      <BotUIMessageList />
      <BotUIAction />
    </>
  )}
</BotUI>
```

### Granular Error Boundaries

```tsx
<BotUI bot={bot}>
  <BotUIErrorBoundary
    level="ui"
    fallback={() => <div>Chat interface error</div>}
  >
    <BotUIMessageList />
    <BotUIAction />
  </BotUIErrorBoundary>
</BotUI>
```

## Error Context

The `BotUIContext` now includes an `errors` array that contains all bot errors:

```tsx
const { bot, errors } = useContext(BotUIContext)
const errors = useBotUIErrors() // Convenience hook
```

## Error Structure

Bot errors follow the `IBotUIError` interface:

```typescript
interface IBotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: string
}
```

## Styling

Error components include CSS classes for styling:

- `.botui-errors` - Error list container
- `.botui-error` - Individual error
- `.botui-error-${type}` - Error by type
- `.botui-error-boundary` - Error boundary fallback
- `.botui-message-error` - Message rendering error
- `.botui-action-error` - Action rendering error
- `.botui-stream-errors` - Stream error container
- `.botui-stream-error` - Individual stream error