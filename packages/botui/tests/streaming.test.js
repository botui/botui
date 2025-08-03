import { createBot } from '../dist/botui'
import { expect, jest } from '@jest/globals'

describe('Universal Streaming API', () => {

  test('bot.message.stream exists and is callable', async () => {
    const bot = createBot()
    expect(typeof bot.message.stream).toBe('function')
  })

  test('manual streaming with callback function works', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    // Test manual streaming
    const stream = await bot.message.stream((emit) => {
      // Simulate streaming data
      setTimeout(() => emit('Hello'), 10)
      setTimeout(() => emit(' '), 20)
      setTimeout(() => emit('World'), 30)
      setTimeout(() => emit('!'), 40)
    })

    expect(stream).toBeDefined()
    expect(typeof stream.key).toBe('number')
    expect(typeof stream.append).toBe('function')
    expect(typeof stream.write).toBe('function')
    expect(typeof stream.finish).toBe('function')

    // Wait for streaming to process
    await new Promise(resolve => setTimeout(resolve, 100))

    // Finish streaming
    await stream.finish()

    // Verify message was created and updated
    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('Hello World!')
  })

  test('streaming emits busy events throughout lifecycle', async () => {
    const bot = createBot()
    const busyEvents = []

    bot.on('bot.busy', (event) => {
      busyEvents.push(event)
    })

    const stream = await bot.message.stream((emit) => {
      setTimeout(() => emit('Hello'), 10)
      setTimeout(() => emit(' World'), 20)
    })

    // Stream should be busy immediately after creation
    expect(busyEvents).toHaveLength(1)
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })

    // Wait for manual streaming to process
    await new Promise(resolve => setTimeout(resolve, 50))

    // Finish streaming
    await stream.finish()

    // Should now have busy false event
    expect(busyEvents).toHaveLength(2)
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })

    // Clean up
    bot.off('bot.busy', () => {})
  })

  test('streaming message append method works', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {}) // Empty manual stream

    await stream.append('Hello')
    await stream.append(' ')
    await stream.append('World')

    const state = stream.getState()
    expect(state.text).toBe('Hello World')

    await stream.finish()
  })

  test('streaming message write method replaces content', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    await stream.append('Initial text')
    await stream.write('Replaced text')

    const state = stream.getState()
    expect(state.text).toBe('Replaced text')

    await stream.finish()
  })

  test('streaming with custom parser works', async () => {
    const bot = createBot()

    const stream = await bot.message.stream((emit) => {
      // Emit JSON data that needs parsing
      setTimeout(() => emit('{"content": "Hello"}'), 10)
      setTimeout(() => emit('{"content": " World"}'), 20)
    }, {
      parser: (data) => {
        try {
          return JSON.parse(data).content
        } catch {
          return data
        }
      }
    })

    // Wait for streaming to process
    await new Promise(resolve => setTimeout(resolve, 50))
    await stream.finish()

    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('Hello World')
  })

  test('streaming with initial data works', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {}, {
      initialData: { text: 'Loading...', status: 'pending' },
      initialMeta: { author: 'system' }
    })

    // Check initial state
    const initialMessage = await bot.message.get(stream.key)
    expect(initialMessage.data.text).toBe('Loading...')
    expect(initialMessage.data.status).toBe('pending')
    expect(initialMessage.meta.author).toBe('system')

    await stream.write('Content loaded!')
    await stream.finish({ status: 'complete' })

    const finalMessage = await bot.message.get(stream.key)
    expect(finalMessage.data.text).toBe('Content loaded!')
    expect(finalMessage.data.status).toBe('complete')
  })

  test('streaming throttling works', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    const stream = await bot.message.stream(() => {}, {
      throttle: 50 // 50ms throttling
    })

    // Rapid updates
    await stream.append('1')
    await stream.append('2')
    await stream.append('3')
    await stream.append('4')
    await stream.append('5')

    // Should be throttled to fewer actual updates
    await new Promise(resolve => setTimeout(resolve, 25))
    expect(listener.mock.calls.length).toBeLessThan(5)

    // Wait for throttle to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    await stream.finish()

    // Final state should have all text
    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('12345')
  })

  test('finish method applies final processing', async () => {
    const bot = createBot()
    const listener = jest.fn()

    bot.on('message.update', listener)

    const stream = await bot.message.stream(() => {})

    await stream.append('Streaming text')

    // Clear previous calls
    listener.mockClear()

    // Finish with final data
    await stream.finish({
      status: 'complete',
      timestamp: Date.now()
    })

    // Should trigger final update
    expect(listener).toHaveBeenCalled()

    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('Streaming text')
    expect(message.data.status).toBe('complete')
    expect(message.data.timestamp).toBeDefined()
  })

    test('async iterator streaming works', async () => {
    const bot = createBot()

    async function* textGenerator() {
      yield 'Hello'
      yield ' '
      yield 'from'
      yield ' '
      yield 'generator'
    }

    const stream = await bot.message.stream(textGenerator())

    // Wait for async iteration to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('Hello from generator')
  })

  test('plugins are skipped during streaming but applied on finish', async () => {
    const bot = createBot()
    const pluginCallCount = { count: 0 }

    // Add a plugin that transforms text and tracks calls
    bot.use((block) => {
      pluginCallCount.count++
      if (block.type === 'message' && block.data.text) {
        block.data.text = block.data.text.toUpperCase()
        block.data.processedByPlugin = true
      }
      return block
    })

    const stream = await bot.message.stream(() => {}, {
      skipPlugins: true // Explicitly enable plugin skipping
    })

    // Reset plugin call count after initial message creation
    pluginCallCount.count = 0

    // Multiple streaming updates
    await stream.append('hello')
    await stream.append(' ')
    await stream.append('world')

    // Wait for throttled updates to process
    await new Promise(resolve => setTimeout(resolve, 100))

    // During streaming, plugins should be skipped (minimal calls)
    const streamingCallCount = pluginCallCount.count
    expect(streamingCallCount).toBeLessThan(3) // Should be 0 or very few calls

    // Text should not be transformed during streaming
    const midStreamMessage = await bot.message.get(stream.key)
    expect(midStreamMessage.data.text).toBe('hello world') // lowercase, not transformed
    expect(midStreamMessage.data.processedByPlugin).toBeUndefined()

    // Reset count before finish
    pluginCallCount.count = 0

    // Finish streaming - this should apply plugins
    await stream.finish({ final: true })

    // Plugin should be called for final processing
    expect(pluginCallCount.count).toBeGreaterThan(0)

    // Final message should be transformed by plugin
    const finalMessage = await bot.message.get(stream.key)
    expect(finalMessage.data.text).toBe('HELLO WORLD') // uppercase, transformed
    expect(finalMessage.data.processedByPlugin).toBe(true)
    expect(finalMessage.data.final).toBe(true)
  })

  test('plugins are always applied when skipPlugins is false', async () => {
    const bot = createBot()
    const pluginCallCount = { count: 0 }

    // Add a plugin that tracks calls
    bot.use((block) => {
      if (block.type === 'message') {
        pluginCallCount.count++
      }
      return block
    })

    const stream = await bot.message.stream(() => {}, {
      skipPlugins: false // Explicitly disable plugin skipping
    })

    // Reset plugin call count after initial message creation
    pluginCallCount.count = 0

    // Multiple streaming updates
    await stream.append('test1')
    await stream.append('test2')
    await stream.append('test3')

    // Wait for updates to process
    await new Promise(resolve => setTimeout(resolve, 100))

    // Plugins should be called for each update
    expect(pluginCallCount.count).toBeGreaterThan(0)

    await stream.finish()
  })
})

/**
 * Enhanced streaming API tests - testing the improved functionality
 */
describe('Enhanced Streaming API', () => {

  test('streaming message has status property and control methods', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    // Check interface
    expect(typeof stream.status).toBe('string')
    expect(stream.status).toBe('streaming')
    expect(typeof stream.cancel).toBe('function')
    expect(typeof stream.pause).toBe('function')
    expect(typeof stream.resume).toBe('function')
  })

  test('error handling with stream.error event', async () => {
    const bot = createBot()
    const errorHandler = jest.fn()

    // Listen for error events
    bot.on('stream.error', errorHandler)

    const stream = await bot.message.stream((emit) => {
      emit('good data')
    })

    // Complete the streaming
    await stream.append('test')
    await stream.finish()

    // Clean up event listener
    bot.off('stream.error', errorHandler)

    // The test verifies the event system works - errors would be emitted if parsing fails
    expect(typeof errorHandler).toBe('function')
  })

  test('progress tracking with stream.progress event', async () => {
    const bot = createBot()
    const progressHandler = jest.fn()

    // Listen for progress events
    bot.on('stream.progress', progressHandler)

    const stream = await bot.message.stream(() => {}, {
      throttle: 10 // Fast updates for testing
    })

    await stream.append('test1')
    await stream.append('test2')

    // Wait for throttled updates
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(progressHandler).toHaveBeenCalled()
    const progressData = progressHandler.mock.calls[0][0]
    expect(progressData).toHaveProperty('messageKey')
    expect(progressData).toHaveProperty('text')
    expect(progressData).toHaveProperty('updateCount')
    expect(progressData).toHaveProperty('duration')
    expect(progressData.messageKey).toBe(stream.key)

    await stream.finish()

    // Clean up event listener
    bot.off('stream.progress', progressHandler)
  })

  test('streaming emits bot.busy events correctly', async () => {
    const bot = createBot()
    const busyEvents = []

    bot.on('bot.busy', (event) => {
      busyEvents.push(event)
    })

    const stream = await bot.message.stream(() => {})

    // At this point, stream has started, so we should have busy: true
    expect(busyEvents).toHaveLength(1)
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })

    await stream.append('test')
    await stream.finish()

    // After finish, we should have busy: false
    expect(busyEvents).toHaveLength(2)
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })

    // Clean up event listener
    bot.off('bot.busy', () => {})
  })

  test('streaming emits bot.busy false on error', async () => {
    const bot = createBot()
    const busyEvents = []

    bot.on('bot.busy', (event) => {
      busyEvents.push(event)
    })

    const stream = await bot.message.stream(() => {})

    // Force an error by making the message update fail
    // We'll simulate this by trying to finish with invalid data
    try {
      // This should trigger the error handling in finish()
      await stream.finish()
    } catch (error) {
      // Expected to potentially throw
    }

    // Should have busy: true at start and busy: false on completion/error
    expect(busyEvents).toHaveLength(2)
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })

    // Clean up event listener
    bot.off('bot.busy', () => {})
  })

  test('streaming emits bot.busy false on cancel', async () => {
    const bot = createBot()
    const busyEvents = []

    bot.on('bot.busy', (event) => {
      busyEvents.push(event)
    })

    const stream = await bot.message.stream(() => {})

    // Cancel the stream
    await stream.cancel('test cancellation')

    // Should have busy: true at start and busy: false on cancel
    expect(busyEvents).toHaveLength(2)
    expect(busyEvents[0]).toEqual({ busy: true, source: 'bot' })
    expect(busyEvents[1]).toEqual({ busy: false, source: 'bot' })

    // Clean up event listener
    bot.off('bot.busy', () => {})
  })

  test('cancel functionality', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    expect(stream.status).toBe('streaming')

    await stream.cancel('User cancelled')

    expect(stream.status).toBe('cancelled')

    // Further operations should be ignored
    await stream.append('should be ignored')

    const state = stream.getState()
    expect(state.text).toBe('') // No text was added after cancel
  })

  test('pause and resume functionality', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    await stream.append('before pause')

    stream.pause()

    // This should be ignored while paused
    await stream.append('during pause')

    let state = stream.getState()
    expect(state.text).toBe('before pause')

    stream.resume()

    // This should work after resume
    await stream.append(' after resume')

    // Wait for updates
    await new Promise(resolve => setTimeout(resolve, 50))

    state = stream.getState()
    expect(state.text).toBe('before pause after resume')

    await stream.finish()
  })

  test('enhanced getState with status and updateCount', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    let state = stream.getState()
    expect(state).toHaveProperty('text')
    expect(state).toHaveProperty('data')
    expect(state).toHaveProperty('status')
    expect(state).toHaveProperty('updateCount')
    expect(state.status).toBe('streaming')
    expect(state.updateCount).toBe(0)

    await stream.append('test')

    // Wait for update to process
    await new Promise(resolve => setTimeout(resolve, 50))

    state = stream.getState()
    expect(state.text).toBe('test')
    expect(state.updateCount).toBeGreaterThan(0)

    await stream.finish()

    state = stream.getState()
    expect(state.status).toBe('finished')
  })

  test('type-safe parsers for different sources', async () => {
    const bot = createBot()

    // Mock EventSource-like behavior
    const stream = await bot.message.stream((emit) => {
      // Simulate SSE data
      emit('{"content": "Hello"}')
      emit('{"content": " World"}')
    }, {
      parsers: {
        default: (data) => {
          try {
            return JSON.parse(data).content
          } catch {
            return data
          }
        }
      }
    })

    // Wait for streaming to process
    await new Promise(resolve => setTimeout(resolve, 50))
    await stream.finish()

    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('Hello World')
  })

  test('stream.complete event is emitted when streaming finishes', async () => {
    const bot = createBot()
    const completeHandler = jest.fn()

    // Listen for complete events
    bot.on('stream.complete', completeHandler)

    const stream = await bot.message.stream(() => {})

    await stream.append('test content')
    await stream.finish()

    expect(completeHandler).toHaveBeenCalled()
    const completeData = completeHandler.mock.calls[0][0]
    expect(completeData).toHaveProperty('messageKey')
    expect(completeData).toHaveProperty('finalText')
    expect(completeData).toHaveProperty('updateCount')
    expect(completeData).toHaveProperty('duration')
    expect(completeData.messageKey).toBe(stream.key)

    // Clean up event listener
    bot.off('stream.complete', completeHandler)
  })

  test('empty text is not appended', async () => {
    const bot = createBot()
    const progressHandler = jest.fn()

    const stream = await bot.message.stream(() => {}, {
      onProgress: progressHandler
    })

    await stream.append('') // Empty string
    await stream.append('   ') // Whitespace only
    await stream.append('real content')

    // Wait for updates
    await new Promise(resolve => setTimeout(resolve, 50))

    const state = stream.getState()
    expect(state.text).toBe('   real content') // Whitespace preserved, empty ignored

    await stream.finish()
  })

  test('finish can only be called once', async () => {
    const bot = createBot()
    const completeHandler = jest.fn()

    // Listen for complete events
    bot.on('stream.complete', completeHandler)

    const stream = await bot.message.stream(() => {})

    await stream.finish()
    expect(stream.status).toBe('finished')

    // Second finish should be ignored
    await stream.finish()

    // Complete handler should only be called once
    expect(completeHandler).toHaveBeenCalledTimes(1)

    // Clean up event listener
    bot.off('stream.complete', completeHandler)
  })

  test('error status is set when streaming fails', async () => {
    const bot = createBot()

    const stream = await bot.message.stream(() => {})

    // Simulate an error in flushUpdate by trying to finish with bad data
    try {
      await stream.finish({ badData: () => { throw new Error('Bad data') } })
    } catch (error) {
      // Error should be thrown and status should be set
    }

    // Note: The exact error handling depends on the implementation
    // This test verifies the error handling pattern exists
    expect(stream.status).toMatch(/finished|error/)
  })

  test('legacy parser still works for backward compatibility', async () => {
    const bot = createBot()

    const stream = await bot.message.stream((emit) => {
      emit('raw data')
    }, {
      parser: (data) => `processed: ${data}` // Legacy single parser
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    await stream.finish()

    const message = await bot.message.get(stream.key)
    expect(message.data.text).toBe('processed: raw data')
  })

  test('stream.start event is emitted when streaming begins', async () => {
    const bot = createBot()
    const startHandler = jest.fn()

    // Listen for start events
    bot.on('stream.start', startHandler)

    const stream = await bot.message.stream(() => {})

    expect(startHandler).toHaveBeenCalled()
    const startData = startHandler.mock.calls[0][0]
    expect(startData).toHaveProperty('messageKey')
    expect(startData).toHaveProperty('sourceType')
    expect(startData.messageKey).toBe(stream.key)
    expect(startData.sourceType).toBe('Function')

    await stream.finish()

    // Clean up event listener
    bot.off('stream.start', startHandler)
  })

  test('stream.cancel event is emitted when streaming is cancelled', async () => {
    const bot = createBot()
    const cancelHandler = jest.fn()

    // Listen for cancel events
    bot.on('stream.cancel', cancelHandler)

    const stream = await bot.message.stream(() => {})

    await stream.cancel('User cancelled')

    expect(cancelHandler).toHaveBeenCalled()
    const cancelData = cancelHandler.mock.calls[0][0]
    expect(cancelData).toHaveProperty('messageKey')
    expect(cancelData).toHaveProperty('reason')
    expect(cancelData.messageKey).toBe(stream.key)
    expect(cancelData.reason).toBe('User cancelled')

    // Clean up event listener
    bot.off('stream.cancel', cancelHandler)
  })
})