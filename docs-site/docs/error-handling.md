# Error Handling and Debugging

A comprehensive guide to handling errors gracefully and debugging BotUI applications effectively.

## Common Error Scenarios

### 1. Bot Auto-Resolving (Hot Reload Issues)

**Problem**: Bot seems to skip actions and resolve automatically, especially in development.

**Cause**: Multiple bot instances or hot-reload triggering effects multiple times.

**Solution**:

```jsx
import { useRef, useEffect } from 'react'

const MyBot = () => {
  const botRef = useRef(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true
      botRef.current = createBot()
      startConversation(botRef.current)
    }
  }, [])

  return (
    <BotUI bot={botRef.current}>
      <BotUIMessageList />
      <BotUIAction />
    </BotUI>
  )
}
```

### 2. Plugin Errors Breaking Bot Flow

**Problem**: Plugin throws error and breaks the entire conversation.

**Solution**: Implement error boundaries in plugins:

```jsx
const safePlugin = (block) => {
  try {
    // Your plugin logic
    if (block.type === BOTUI_BLOCK_TYPES.MESSAGE) {
      block.data.text = processText(block.data.text)
    }
    return block
  } catch (error) {
    console.error('Plugin error:', error, 'Block:', block)

    // Add error indicator to meta
    block.meta.pluginError = {
      message: error.message,
      timestamp: new Date().toISOString()
    }

    // Return original block to prevent breaking the flow
    return block
  }
}

myBot.use(safePlugin)
```

### 3. Custom Renderer Errors

**Problem**: Custom renderer components throw errors and crash the UI.

**Solution**: Use React Error Boundaries:

```jsx
import React from 'react'

class BotUIErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('BotUI Error:', error, errorInfo)

    // Log to your error reporting service
    // errorReportingService.log(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="botui-error">
          <p>Something went wrong with this message.</p>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrap your custom renderers
const SafeCustomRenderer = (props) => (
  <BotUIErrorBoundary>
    <CustomRenderer {...props} />
  </BotUIErrorBoundary>
)
```

### 4. Promise Rejection Handling

**Problem**: Unhandled promise rejections in bot flow.

**Solution**: Always handle promise rejections:

```jsx
const runBot = async (bot) => {
  try {
    await bot.message.add({ text: 'Starting...' })

    const response = await bot.action.set(
      { placeholder: 'Enter something' },
      { actionType: 'input' }
    )

    // Process response
    await bot.message.add({ text: `You entered: ${response.value}` })

  } catch (error) {
    console.error('Bot flow error:', error)

    // Show error to user
    await bot.message.add({
      text: 'Sorry, something went wrong. Please try again.'
    })

    // Optionally restart or provide recovery options
    await showErrorRecoveryOptions(bot)
  }
}

const showErrorRecoveryOptions = async (bot) => {
  const recovery = await bot.action.set(
    {
      options: [
        { label: 'Start over', value: 'restart' },
        { label: 'Contact support', value: 'support' },
        { label: 'Exit', value: 'exit' }
      ]
    },
    { actionType: 'selectButtons' }
  )

  switch (recovery.selected.value) {
    case 'restart':
      await runBot(bot)
      break
    case 'support':
      await bot.message.add({
        text: 'Please contact support at support@example.com'
      })
      break
    // exit case handles itself
  }
}
```

## Validation and Input Handling

### User Input Validation

```jsx
const ValidationAction = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const [value, setValue] = useState('')
  const [errors, setErrors] = useState([])

  const validators = {
    required: (value) => value.trim() ? null : 'This field is required',
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : 'Please enter a valid email'
    },
    minLength: (min) => (value) =>
      value.length >= min ? null : `Minimum ${min} characters required`,
    maxLength: (max) => (value) =>
      value.length <= max ? null : `Maximum ${max} characters allowed`,
    pattern: (regex, message) => (value) =>
      regex.test(value) ? null : message
  }

  const validate = (inputValue) => {
    const rules = action.meta.validation || {}
    const newErrors = []

    Object.entries(rules).forEach(([rule, config]) => {
      const validator = validators[rule]
      if (!validator) return

      let error
      if (typeof config === 'boolean' && config) {
        error = validator(inputValue)
      } else if (typeof config === 'object') {
        error = validator(config.value)(inputValue)
      } else {
        error = validator(config)(inputValue)
      }

      if (error) {
        newErrors.push(error)
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = () => {
    if (validate(value)) {
      bot.next({ value, isValid: true })
    }
  }

  return (
    <div className="validation-input">
      <input
        type={action.data.type || 'text'}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (errors.length > 0) {
            validate(e.target.value) // Re-validate on change if errors exist
          }
        }}
        onBlur={() => validate(value)} // Validate on blur
        placeholder={action.data.placeholder}
      />
      <button onClick={handleSubmit} disabled={errors.length > 0}>
        Continue
      </button>
      {errors.length > 0 && (
        <div className="validation-errors">
          {errors.map((error, index) => (
            <div key={index} className="error">{error}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Debugging Tools

### 1. Debug Plugin

```jsx
const debugPlugin = (enabled = true) => (block) => {
  if (!enabled) return block

  console.group(`🤖 BotUI Debug - ${block.type.toUpperCase()}`)
  console.log('Block Key:', block.key)
  console.log('Type:', block.type)
  console.log('Data:', block.data)
  console.log('Meta:', block.meta)
  console.log('Full Block:', block)
  console.groupEnd()

  return block
}

// Use in development
if (process.env.NODE_ENV === 'development') {
  myBot.use(debugPlugin(true))
}
```

### 2. State Inspector

```jsx
const StateInspector = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const messages = useBotUIMessage()
  const [isOpen, setIsOpen] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="debug-inspector">
      <button onClick={() => setIsOpen(!isOpen)}>
        🔍 Debug Inspector
      </button>

      {isOpen && (
        <div className="debug-panel">
          <h4>Current Action</h4>
          <pre>{JSON.stringify(action, null, 2)}</pre>

          <h4>Messages ({messages.length})</h4>
          <pre>{JSON.stringify(messages, null, 2)}</pre>

          <h4>Bot Methods</h4>
          <button onClick={() => console.log('Bot instance:', bot)}>
            Log Bot to Console
          </button>
        </div>
      )}
    </div>
  )
}

// Include in your app during development
<BotUI bot={myBot}>
  <BotUIMessageList />
  <BotUIAction />
  <StateInspector />
</BotUI>
```

### 3. Conversation Logger

```jsx
const ConversationLogger = () => {
  const messages = useBotUIMessage()

  useEffect(() => {
    // Log conversation changes
    console.log('Conversation updated:', {
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]
    })
  }, [messages])

  const exportConversation = () => {
    const conversation = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        type: msg.type,
        data: msg.data,
        meta: msg.meta,
        key: msg.key
      }))
    }

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${Date.now()}.json`
    a.click()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <button onClick={exportConversation}>
      📥 Export Conversation
    </button>
  )
}
```

## Performance Monitoring

### 1. Performance Plugin

```jsx
const performancePlugin = (block) => {
  const startTime = performance.now()

  // Mark the start of block processing
  performance.mark(`botui-block-${block.key}-start`)

  // Add timing info to meta
  block.meta.performance = {
    processedAt: new Date().toISOString(),
    startTime
  }

  // Measure after a microtask to capture processing time
  setTimeout(() => {
    const endTime = performance.now()
    performance.mark(`botui-block-${block.key}-end`)
    performance.measure(
      `botui-block-${block.key}`,
      `botui-block-${block.key}-start`,
      `botui-block-${block.key}-end`
    )

    console.log(`Block ${block.key} processed in ${endTime - startTime}ms`)
  }, 0)

  return block
}

myBot.use(performancePlugin)
```

### 2. Memory Usage Monitor

```jsx
const MemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!memoryInfo || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="memory-monitor">
      <small>
        Memory: {memoryInfo.used}MB / {memoryInfo.total}MB
        (Limit: {memoryInfo.limit}MB)
      </small>
    </div>
  )
}
```

## Error Recovery Patterns

### 1. Graceful Degradation

```jsx
const GracefulRenderer = ({ message }) => {
  try {
    // Try to render complex component
    return <ComplexCustomComponent data={message.data} />
  } catch (error) {
    console.warn('Complex renderer failed, falling back to simple:', error)

    // Fallback to simple text rendering
    return (
      <div className="fallback-message">
        <p>{message.data.text || 'Message could not be displayed'}</p>
        {message.data.fallbackText && (
          <p><em>{message.data.fallbackText}</em></p>
        )}
      </div>
    )
  }
}
```

### 2. Retry Mechanisms

```jsx
const retryableAction = async (bot, actionData, actionMeta, maxRetries = 3) => {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const result = await bot.action.set(actionData, actionMeta)
      return result
    } catch (error) {
      attempts++
      console.warn(`Action attempt ${attempts} failed:`, error)

      if (attempts >= maxRetries) {
        await bot.message.add({
          text: 'Sorry, this action failed multiple times. Please try again later.'
        })
        throw error
      }

      await bot.message.add({
        text: `Something went wrong. Retrying... (${attempts}/${maxRetries})`
      })

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
    }
  }
}
```

### 3. Health Checks

```jsx
const HealthChecker = () => {
  const bot = useBotUI()
  const [health, setHealth] = useState('unknown')

  const checkHealth = async () => {
    try {
      // Test basic bot functionality
      await bot.message.getAll()
      await bot.action.get()

      setHealth('healthy')
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth('unhealthy')
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  const handleReconnect = () => {
    window.location.reload() // Simple recovery
  }

  if (health === 'unhealthy') {
    return (
      <div className="health-warning">
        <p>⚠️ Bot connection lost</p>
        <button onClick={handleReconnect}>Reconnect</button>
      </div>
    )
  }

  return null
}
```

## Testing Error Scenarios

### Unit Testing Error Conditions

```jsx
import { createBot, BOTUI_BLOCK_TYPES } from 'botui'

describe('Error Handling', () => {
  test('plugin errors should not break bot flow', async () => {
    const bot = createBot()

    // Add a plugin that throws
    const faultyPlugin = (block) => {
      if (block.data.text === 'trigger error') {
        throw new Error('Test error')
      }
      return block
    }

    // Wrap with error handling
    const safePlugin = (block) => {
      try {
        return faultyPlugin(block)
      } catch (error) {
        block.meta.hasError = true
        return block
      }
    }

    bot.use(safePlugin)

    // This should not throw
    await bot.message.add({ text: 'trigger error' })

    const messages = await bot.message.getAll()
    expect(messages[0].meta.hasError).toBe(true)
  })

  test('should handle invalid action data gracefully', async () => {
    const bot = createBot()

    // This should not crash the bot
    await expect(bot.action.set(null, null)).rejects.toThrow()

    // Bot should still be functional
    await bot.message.add({ text: 'Recovery test' })
    const messages = await bot.message.getAll()
    expect(messages).toHaveLength(1)
  })
})
```

## Best Practices

1. **Always use error boundaries** around custom renderers
2. **Implement graceful fallbacks** for complex components
3. **Validate user input** before processing
4. **Log errors** but don't expose sensitive information
5. **Provide clear recovery options** to users
6. **Test error scenarios** in development
7. **Monitor performance** in production
8. **Use debugging tools** during development

By following these patterns, you can build robust BotUI applications that handle errors gracefully and provide excellent user experiences even when things go wrong.