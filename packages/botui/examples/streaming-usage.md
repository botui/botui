# BotUI Universal Streaming API

The `bot.message.stream()` method provides a single, intuitive interface for high-performance streaming across all scenarios.

## Quick Start

```typescript
import { createBot } from 'botui'

const bot = createBot()

// Any streaming source works with the same API
const stream = await bot.message.stream(source, options)

// Access stream status and controls
console.log(stream.status) // 'streaming' | 'finished' | 'cancelled' | 'error'
console.log(stream.key)    // Message key for direct BotUI operations
```

## Server-Sent Events (OpenAI, Anthropic, etc.)

```typescript
// OpenAI streaming with type-safe parser (default events)
const eventSource = new EventSource('/api/openai-stream')
const stream = await bot.message.stream(eventSource, {
  parsers: {
    sse: (data) => {
      const parsed = JSON.parse(data)
      return parsed.choices[0]?.delta?.content || ''
    }
  }
})

// OpenAI streaming with custom events
const stream2 = await bot.message.stream(eventSource, {
  parsers: {
    sse: (data) => {
      const parsed = JSON.parse(data)
      return parsed.choices[0]?.delta?.content || ''
    }
  },
  events: {
    sse: {
      dataEvent: 'chat-message',
      endEvent: 'chat-complete',
      customEvents: {
        'heartbeat': (event) => console.log('Connection alive'),
        'rate-limit': (event) => console.warn('Rate limit warning')
      }
    }
  }
})

// Legacy parser syntax (still supported)
const stream3 = await bot.message.stream(eventSource, {
  parser: (data) => {
    const parsed = JSON.parse(data)
    return parsed.choices[0]?.delta?.content || ''
  }
})

// The stream automatically handles cleanup when SSE ends
```

## WebSocket Streaming

```typescript
const websocket = new WebSocket('wss://api.example.com/stream')

// WebSocket streaming with default events
const stream = await bot.message.stream(websocket, {
  parsers: {
    websocket: (event) => {
      const data = JSON.parse(event.data)
      return data.message || data.content || ''
    }
  },
  throttle: 32, // ~30fps for smooth animation
})

// WebSocket streaming with custom events
const stream2 = await bot.message.stream(websocket, {
  parsers: {
    websocket: (event) => {
      const data = JSON.parse(event.data)
      return data.message || data.content || ''
    }
  },
  events: {
    websocket: {
      dataEvent: 'text-chunk',
      endEvent: 'stream-done',
      errorEvent: 'connection-error',
      customEvents: {
        'ping': (event) => console.log('Ping received'),
        'pong': (event) => console.log('Pong received'),
        'user-joined': (event) => console.log('User joined:', event.data)
      }
    }
  },
  throttle: 32
})

// Auto-cleanup on WebSocket close
```

## WebRTC Data Channel

```typescript
const dataChannel = peerConnection.createDataChannel('chat')

// WebRTC streaming with default events
const stream = await bot.message.stream(dataChannel, {
  parsers: {
    dataChannel: (data) => {
      return typeof data === 'string' ? data : new TextDecoder().decode(data)
    }
  }
})

// WebRTC streaming with custom events
const stream2 = await bot.message.stream(dataChannel, {
  parsers: {
    dataChannel: (data) => {
      return typeof data === 'string' ? data : new TextDecoder().decode(data)
    }
  },
  events: {
    dataChannel: {
      dataEvent: 'message',
      endEvent: 'datachannel-close',
      errorEvent: 'datachannel-error',
      customEvents: {
        'connection-state-change': (event) => console.log('Connection state:', event.data),
        'buffered-amount-low': (event) => console.log('Buffer low, safe to send'),
        'peer-info': (event) => console.log('Peer info:', event.data)
      }
    }
  }
})
```

## Manual Streaming (Fetch API, Custom Logic)

```typescript
const stream = await bot.message.stream(async (emit) => {
  const response = await fetch('/api/stream')
  const reader = response.body!.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = new TextDecoder().decode(value)
      emit(text) // This appends to the streaming message
    }
  } finally {
    reader.releaseLock()
  }
}, {
  parsers: {
    default: (text) => text // Optional parser
  }
})
```

## Async Iterator/Generator Streaming

```typescript
async function* generateText() {
  const words = ['Hello', ' ', 'world', '!', ' ', 'Streaming', ' ', 'complete.']
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 100))
    yield word
  }
}

const stream = await bot.message.stream(generateText(), {
  parsers: {
    iterator: (value) => value // Optional parser for iterator values
  }
})
```

## Advanced Configuration

```typescript
const stream = await bot.message.stream(source, {
  // Performance options
  throttle: 16,        // Update every 16ms (~60fps)
  maxDelay: 100,       // Force update every 100ms max
  skipPlugins: true,   // Skip plugins during streaming for performance

  // Type-safe parsers for different source types
  parsers: {
    sse: (data) => extractTextFromSSEData(data),
    websocket: (event) => extractTextFromWSEvent(event),
    dataChannel: (data) => extractTextFromDCData(data),
    iterator: (value) => extractTextFromIteratorValue(value),
    default: (data) => extractTextFromData(data)
  },

  // Legacy parser (still supported)
  parser: (data) => extractTextFromData(data),

  // Initial message setup
  initialData: { text: '🤖 AI is thinking...' },
  initialMeta: { author: 'assistant', streaming: true },

  // Event configuration per streaming type
  events: {
    sse: {
      dataEvent: 'data',     // Listen for 'data' events instead of 'message'
      endEvent: 'done',      // Custom end event name
      errorEvent: 'error',   // Custom error event name
      customEvents: {
        'heartbeat': (event) => console.log('Heartbeat received'),
        'rate-limit': (event) => console.warn('Rate limit warning'),
        'metadata': (event) => console.log('Metadata:', event.data)
      }
    },
    websocket: {
      dataEvent: 'text-chunk',
      endEvent: 'stream-complete',
      errorEvent: 'ws-error',
      customEvents: {
        'ping': (event) => console.log('Ping received'),
        'pong': (event) => console.log('Pong received'),
        'user-typing': (event) => console.log('User is typing')
      }
    },
    dataChannel: {
      dataEvent: 'data-message',
      endEvent: 'channel-close',
      errorEvent: 'channel-error',
      customEvents: {
        'peer-connected': (event) => console.log('Peer connected'),
        'peer-disconnected': (event) => console.log('Peer disconnected'),
        'quality-update': (event) => console.log('Quality:', event.data)
      }
    }
  },

  // Retry configuration
  maxRetries: 3,       // Number of retries for failed connections
  retryDelay: 1000,    // Delay between retries in ms
})
```

## Event Configuration API

The new Event Configuration API provides flexible event handling for all event-based streaming types (EventSource, WebSocket, RTCDataChannel). This allows custom protocols and advanced event management.

### Event Configuration Options

```typescript
interface StreamingEventConfig {
  /** Event type for data messages (default: 'message') */
  dataEvent?: string
  /** Event type for stream completion (default: 'end' for SSE, 'close' for WS/RTC) */
  endEvent?: string
  /** Event type for errors (default: 'error') */
  errorEvent?: string
  /** Custom event handlers for additional events */
  customEvents?: Record<string, (event: any) => void>
}
```

### Usage Examples

#### Custom SSE Events (for specialized AI services)
```typescript
const eventSource = new EventSource('/api/custom-ai')
const stream = await bot.message.stream(eventSource, {
  events: {
    sse: {
      dataEvent: 'ai-response',      // Instead of 'message'
      endEvent: 'ai-complete',       // Instead of 'end'
      errorEvent: 'ai-error',        // Instead of 'error'
      customEvents: {
        'token-count': (event) => {
          console.log('Tokens used:', JSON.parse(event.data).count)
        },
        'model-switch': (event) => {
          console.log('Switched to model:', JSON.parse(event.data).model)
        },
        'rate-limit-warning': (event) => {
          console.warn('Approaching rate limit')
        }
      }
    }
  },
  parsers: {
    sse: (data) => JSON.parse(data).content || ''
  }
})
```

#### Custom WebSocket Protocol
```typescript
const websocket = new WebSocket('wss://custom-chat.example.com')
const stream = await bot.message.stream(websocket, {
  events: {
    websocket: {
      dataEvent: 'chat-message',
      endEvent: 'session-end',
      errorEvent: 'chat-error',
      customEvents: {
        'user-joined': (event) => {
          const user = JSON.parse(event.data)
          console.log(`${user.name} joined the chat`)
        },
        'user-left': (event) => {
          const user = JSON.parse(event.data)
          console.log(`${user.name} left the chat`)
        },
        'typing-indicator': (event) => {
          const data = JSON.parse(event.data)
          console.log(`${data.user} is typing...`)
        },
        'message-reaction': (event) => {
          const data = JSON.parse(event.data)
          console.log(`${data.user} reacted with ${data.emoji}`)
        }
      }
    }
  },
  parsers: {
    websocket: (event) => {
      const data = JSON.parse(event.data)
      return data.content || ''
    }
  }
})
```

#### WebRTC Data Channel with Peer Events
```typescript
const dataChannel = peerConnection.createDataChannel('stream')
const stream = await bot.message.stream(dataChannel, {
  events: {
    dataChannel: {
      dataEvent: 'stream-data',
      endEvent: 'peer-disconnect',
      errorEvent: 'connection-failed',
      customEvents: {
        'peer-info': (event) => {
          console.log('Peer information:', event.data)
        },
        'quality-change': (event) => {
          console.log('Stream quality changed:', event.data)
        },
        'buffer-state': (event) => {
          console.log('Buffer state:', event.data)
        }
      }
    }
  },
  parsers: {
    dataChannel: (data) => {
      // Handle both string and binary data
      if (typeof data === 'string') {
        return JSON.parse(data).message || ''
      } else {
        return new TextDecoder().decode(data)
      }
    }
  }
})
```

### Default Event Names

When no custom events are specified, these defaults are used:

| Streaming Type | Data Event | End Event | Error Event |
|----------------|------------|-----------|-------------|
| EventSource    | `message`  | `end`     | `error`     |
| WebSocket      | `message`  | `close`   | `error`     |
| RTCDataChannel | `message`  | `close`   | `error`     |

### Mixed Configuration

You can mix custom and default event names:

```typescript
const stream = await bot.message.stream(websocket, {
  events: {
    websocket: {
      dataEvent: 'custom-data',  // Custom data event
      // endEvent and errorEvent will use defaults ('close' and 'error')
      customEvents: {
        'ping': (event) => console.log('Ping received')
      }
    }
  }
})
```

## Working with the Streaming Message

```typescript
const stream = await bot.message.stream(source)

// Manual text operations
await stream.append(' additional text')
await stream.write('replace entire text')

// Update other data
await stream.update({
  text: 'new text',
  status: 'processing',
  progress: 0.5
})

// Stream control methods
stream.pause()  // Pause streaming temporarily
stream.resume() // Resume paused streaming

// Cancel streaming
await stream.cancel('User requested cancellation')

// Get current state without triggering updates
const state = stream.getState()
console.log('Current text:', state.text)
console.log('Update count:', state.updateCount)
console.log('Status:', state.status)

// Finish streaming with final processing
await stream.finish({
  status: 'complete',
  finalData: 'any final data'
})

// Access stream properties
console.log('Message key:', stream.key)
console.log('Current status:', stream.status) // 'streaming' | 'finished' | 'cancelled' | 'error'
```

## Streaming Events

```typescript
const stream = await bot.message.stream(source)

// Listen to streaming events
bot.on('stream.start', ({ messageKey, sourceType }) => {
  console.log(`Stream ${messageKey} started with ${sourceType}`)
})

bot.on('stream.progress', ({ messageKey, text, updateCount, duration }) => {
  console.log(`Stream ${messageKey}: ${updateCount} updates in ${duration}ms`)
})

bot.on('stream.complete', ({ messageKey, finalText, updateCount, duration }) => {
  console.log(`Stream ${messageKey} completed: ${updateCount} updates in ${duration}ms`)
})

bot.on('stream.cancel', ({ messageKey, reason }) => {
  console.log(`Stream ${messageKey} cancelled: ${reason}`)
})

bot.on('stream.error', ({ messageKey, error, sourceType }) => {
  console.error(`Stream ${messageKey} error in ${sourceType}:`, error)
})

// Bot busy state events
bot.on('bot.busy', ({ busy, source }) => {
  console.log(`Bot is ${busy ? 'busy' : 'idle'} (source: ${source})`)
})
```

## Error Handling

```typescript
try {
  const stream = await bot.message.stream(source, {
    parsers: {
      sse: (data) => {
        try {
          return JSON.parse(data).content
        } catch {
          return data // Fallback to raw data
        }
      },
      default: (data) => String(data) // Safe fallback parser
    }
  })

  // Handle streaming errors
  bot.on('stream.error', ({ messageKey, error, sourceType }) => {
    console.error(`Stream ${messageKey} failed (${sourceType}):`, error)
    // Optionally show error message to user
    bot.message.update(messageKey, {
      text: 'Streaming encountered an error. Please try again.',
      error: true
    })
  })

} catch (error) {
  console.error('Streaming setup failed:', error)

  // Fallback to regular message
  await bot.message.add({ text: 'Streaming unavailable, using fallback.' })
}
```

## Performance Best Practices

### Mobile Optimization
```typescript
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const stream = await bot.message.stream(source, {
  throttle: isMobile ? 100 : 16, // Slower updates on mobile
  maxDelay: isMobile ? 300 : 100,
  skipPlugins: true // Always skip plugins for streaming
})
```

### Adaptive Throttling
```typescript
let updateCount = 0
const startTime = Date.now()

const stream = await bot.message.stream(source, {
  throttle: 16,
  parser: (data) => {
    updateCount++

    // Adapt throttling based on performance
    if (updateCount % 50 === 0) {
      const avgTime = (Date.now() - startTime) / updateCount
      if (avgTime > 20) {
        // Slow down if updates are taking too long
        stream.options.throttle = Math.min(100, stream.options.throttle * 1.5)
      }
    }

    return data
  }
})
```

### Memory Management
```typescript
const stream = await bot.message.stream(source)

// Clean up when component unmounts (React example)
useEffect(() => {
  return () => {
    stream.finish() // Ensures proper cleanup
  }
}, [])
```

## Real-World Examples

### OpenAI Chat Completion
```typescript
const stream = await bot.message.stream(
  new EventSource('/api/openai/chat/completions'),
  {
    parsers: {
      sse: (data) => {
        if (data === '[DONE]') return ''
        try {
          const parsed = JSON.parse(data)
          return parsed.choices[0]?.delta?.content || ''
        } catch {
          return ''
        }
      }
    },
    initialData: { text: '', role: 'assistant' },
    throttle: 25 // Smooth but not too aggressive
  }
)
```

### WebSocket Chat
```typescript
const ws = new WebSocket('wss://chat.example.com')
const stream = await bot.message.stream(ws, {
  parsers: {
    websocket: (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'message': return data.content
        case 'typing': return '...'
        case 'end': return ''
        default: return ''
      }
    }
  }
})
```

### Custom AI Streaming
```typescript
const stream = await bot.message.stream(async (emit) => {
  const response = await fetch('/api/my-ai', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Hello AI' }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data !== '[DONE]') {
          emit(JSON.parse(data).content)
        }
      }
    }
  }
}, {
  parsers: {
    default: (text) => text // Optional parser for manual streaming
  },
  throttle: 20,
  maxDelay: 150
})
```

## Migration from Legacy Streaming

```typescript
// OLD WAY (inefficient, manual management)
let text = ''
let messageKey

// Manual message creation and updates
websocket.onmessage = async (event) => {
  text += event.data
  if (!messageKey) {
    messageKey = await bot.message.add({ text })
  } else {
    await bot.message.update(messageKey, { text }) // Creates bottlenecks
  }
}

websocket.onclose = () => {
  // Manual cleanup needed
}

// NEW WAY (optimized, automatic management)
const stream = await bot.message.stream(websocket, {
  parsers: {
    websocket: (event) => event.data
  },
  throttle: 16, // 60fps updates
  skipPlugins: true // Performance boost during streaming
})

// Automatic cleanup, batching, throttling, and optimization
// Access to stream controls
stream.pause()  // Pause if needed
stream.resume() // Resume streaming

// Listen to events for monitoring
bot.on('stream.progress', ({ messageKey, updateCount, duration }) => {
  console.log(`${updateCount} updates in ${duration}ms`)
})

bot.on('stream.complete', ({ messageKey, finalText }) => {
  console.log('Streaming completed:', finalText)
})
```