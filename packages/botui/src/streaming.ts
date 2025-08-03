import type { IBotuiInterface, TBlockData, TBlockMeta, IEventEmitter } from './types.js'
import { EBotUIEvents } from './types.js'

/**
 * Universal streaming interface for BotUI
 * Handles SSE, WebSockets, WebRTC, Iterators, and manual streaming with optimal performance
 */

export interface StreamingOptions {
  /** Minimum time between updates in milliseconds (default: 16ms ≈ 60fps) */
  throttle?: number
  /** Maximum time to wait before forcing an update (default: 100ms) */
  maxDelay?: number
  /** Whether to skip plugins during streaming for performance (default: true) */
  skipPlugins?: boolean
}

export interface StreamingMessage {
  /** The message key for direct BotUI operations */
  readonly key: number

  /** Current streaming status */
  readonly status: 'streaming' | 'finished' | 'cancelled' | 'error'

  /** Append text to the streaming message */
  append(text: string): Promise<void>

  /** Replace the entire text content */
  write(text: string): Promise<void>

  /** Update any data on the message */
  update(data: TBlockData, meta?: TBlockMeta): Promise<void>

  /** Finish streaming and apply final processing */
  finish(finalData?: TBlockData, finalMeta?: TBlockMeta): Promise<void>

  /** Cancel streaming immediately */
  cancel(reason?: string): Promise<void>

  /** Pause streaming (can be resumed) */
  pause(): void

  /** Resume paused streaming */
  resume(): void

  /** Get current state without triggering updates */
  getState(): { text: string; data: TBlockData; status: string; updateCount: number }
}

class StreamingMessageImpl implements StreamingMessage {
  public readonly key: number
  private bot: IBotuiInterface
  private emitter: IEventEmitter
  private options: Required<StreamingOptions>
  private pendingData: TBlockData = {}
  private pendingMeta: TBlockMeta = {}
  private currentText = ''
  private updateTimer: NodeJS.Timeout | null = null
  private lastUpdateTime = 0
  private _status: 'streaming' | 'finished' | 'cancelled' | 'error' = 'streaming'
  private updateCount = 0
  private startTime = Date.now()
  private isPaused = false
  private cachedBlock: any = null // Cache for fast path
  private sourceType: string = 'unknown'

  constructor(
    bot: IBotuiInterface,
    emitter: IEventEmitter,
    messageKey: number,
    sourceType: string,
    options: StreamingOptions = {}
  ) {
    this.bot = bot
    this.emitter = emitter
    this.key = messageKey
    this.sourceType = sourceType
    this.options = {
      throttle: 16, // ~60fps
      maxDelay: 100, // Force update every 100ms max
      skipPlugins: true, // Skip plugins during streaming for performance
      ...options,
    }

    // Emit stream start event
    this.emitter.emit(EBotUIEvents.STREAM_START, {
      messageKey: this.key,
      sourceType: this.sourceType
    })

    // Emit busy state when streaming starts
    this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: true, source: 'bot' })
  }

  get status(): 'streaming' | 'finished' | 'cancelled' | 'error' {
    return this._status
  }

  async append(text: string): Promise<void> {
    if (this._status !== 'streaming' || this.isPaused) return

    this.currentText += text
    this.pendingData.text = this.currentText

    return this.scheduleUpdate()
  }

  async write(text: string): Promise<void> {
    if (this._status !== 'streaming' || this.isPaused) return

    this.currentText = text
    this.pendingData.text = this.currentText

    return this.scheduleUpdate()
  }

  async update(data: TBlockData, meta?: TBlockMeta): Promise<void> {
    if (this._status !== 'streaming' || this.isPaused) return

    // Preserve text if it's being streamed
    if (data.text !== undefined && typeof data.text === 'string') {
      this.currentText = data.text
    }

    Object.assign(this.pendingData, data)
    if (meta) {
      Object.assign(this.pendingMeta, meta)
    }

    return this.scheduleUpdate()
  }

  async finish(finalData?: TBlockData, finalMeta?: TBlockMeta): Promise<void> {
    if (this._status !== 'streaming') return
    this._status = 'finished'

    // Clear any pending updates
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    // Apply final data
    if (finalData) {
      Object.assign(this.pendingData, finalData)
    }
    if (finalMeta) {
      Object.assign(this.pendingMeta, finalMeta)
    }

    try {
      // Force final update with full processing (plugins enabled)
      await this.flushUpdate(true)

      // Emit completion event
      this.emitter.emit(EBotUIEvents.STREAM_COMPLETE, {
        messageKey: this.key,
        finalText: this.currentText,
        updateCount: this.updateCount,
        duration: Date.now() - this.startTime
      })

      // Clear busy state when streaming completes
      this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })
    } catch (error) {
      this._status = 'error'

      // Emit error event
      this.emitter.emit(EBotUIEvents.STREAM_ERROR, {
        messageKey: this.key,
        error: error as Error,
        sourceType: this.sourceType
      })

      // Clear busy state when streaming encounters an error
      this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })

      throw error
    }
  }

  async cancel(reason?: string): Promise<void> {
    if (this._status !== 'streaming') return
    this._status = 'cancelled'

    // Clear any pending updates
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    // Emit cancel event
    this.emitter.emit(EBotUIEvents.STREAM_CANCEL, {
      messageKey: this.key,
      reason
    })

    // Clear busy state when streaming is cancelled
    this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })

    // Update message to indicate cancellation
    try {
      await this.bot.message.update(this.key, {
        ...this.pendingData,
        cancelled: true,
        cancelReason: reason
      })
    } catch (error) {
      // Don't throw on cancel cleanup failure
      console.warn('Failed to update cancelled message:', error)
    }
  }

  pause(): void {
    this.isPaused = true
  }

  resume(): void {
    this.isPaused = false
  }

  getState(): { text: string; data: TBlockData; status: string; updateCount: number } {
    return {
      text: this.currentText,
      data: { ...this.pendingData },
      status: this._status,
      updateCount: this.updateCount,
    }
  }

  private async scheduleUpdate(): Promise<void> {
    const now = Date.now()
    const timeSinceLastUpdate = now - this.lastUpdateTime

    // Force update if max delay reached
    if (timeSinceLastUpdate > this.options.maxDelay) {
      return this.flushUpdate()
    }

    // Throttle updates, restart timer on each call
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }
    this.updateTimer = setTimeout(
      () => this.flushUpdate(),
      this.options.throttle
    )
  }

  private async flushUpdate(forceFull = false): Promise<void> {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    if (Object.keys(this.pendingData).length === 0) {
      return
    }

    try {
      // Use appropriate update method based on skipPlugins option and forceFull flag
      if (forceFull || !this.options.skipPlugins) {
        // Full update with plugins (final update or when plugins are enabled)
        await this.bot.message.update(
          this.key,
          this.pendingData,
          Object.keys(this.pendingMeta).length > 0 ? this.pendingMeta : undefined
        )
      } else {
        // TRULY fast update without plugins during streaming
        // Cache the block on first access to avoid repeated async calls
        if (!this.cachedBlock) {
          this.cachedBlock = await this.bot.message.get(this.key)
        }

        // Direct mutation for performance (skipping plugins)
        Object.assign(this.cachedBlock.data, this.pendingData)
        if (Object.keys(this.pendingMeta).length > 0) {
          Object.assign(this.cachedBlock.meta, this.pendingMeta)
        }

        // Emit update event directly
        this.bot.emit(EBotUIEvents.MESSAGE_UPDATE, {
          id: this.key.toString(),
          block: this.cachedBlock,
        })
      }

      // Track progress and emit event
      this.updateCount++
      const duration = Date.now() - this.startTime
      this.emitter.emit(EBotUIEvents.STREAM_PROGRESS, {
        messageKey: this.key,
        text: this.currentText,
        updateCount: this.updateCount,
        duration
      })

    } catch (error) {
      this._status = 'error'

      // Emit error event
      this.emitter.emit(EBotUIEvents.STREAM_ERROR, {
        messageKey: this.key,
        error: error as Error,
        sourceType: this.sourceType
      })

      throw error
    }

    // Reset pending changes
    this.pendingData = { text: this.currentText } // Keep text for next update
    this.pendingMeta = {}
    this.lastUpdateTime = Date.now()
  }
}

/**
 * Type-safe parsers for different streaming sources
 */
export interface StreamingParsers {
  /** Parser for EventSource (receives event.data as string) */
  sse?: (data: string) => string
  /** Parser for WebSocket (receives MessageEvent) */
  websocket?: (event: MessageEvent) => string
  /** Parser for RTCDataChannel (receives event.data - string or binary) */
  dataChannel?: (data: string | ArrayBuffer | Blob) => string
  /** Parser for async iterators (receives iterator values) */
  iterator?: (value: string) => string
  /** Fallback parser for unknown types */
  default?: (data: any) => string
}

/**
 * Universal streaming source type
 */
type StreamingSource =
  | EventSource // SSE
  | WebSocket // WebSocket
  | RTCDataChannel // WebRTC
  | AsyncIterable<string> // Async iterators, generators
  | ((handler: (text: string) => void) => void | (() => void)) // Manual streaming

/**
 * Universal streaming configuration
 */
interface StreamConfig extends StreamingOptions {
  /** Type-safe parsers for different source types */
  parsers?: StreamingParsers
  /** Legacy single parser (deprecated - use parsers instead) */
  parser?: (data: any) => string
  /** Initial message data */
  initialData?: TBlockData
  /** Initial message metadata */
  initialMeta?: TBlockMeta
  /** Event type for EventSource (default: 'message') */
  eventType?: string
  /** End event name for custom cleanup */
  endEvent?: string
  /** Retry failed connections (default: 0) */
  maxRetries?: number
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number
}

/**
 * Universal streaming method - handles all streaming scenarios
 *
 * @example
 * // SSE streaming (OpenAI, etc.)
 * const stream = await bot.message.stream(new EventSource('/api/chat'))
 *
 * @example
 * // WebSocket streaming
 * const stream = await bot.message.stream(websocket, {
 *   parser: (event) => JSON.parse(event.data).content
 * })
 *
 * @example
 * // Manual streaming
 * const stream = await bot.message.stream((emit) => {
 *   fetch('/api/stream').then(response => {
 *     const reader = response.body.getReader()
 *     // ... read chunks and call emit(chunk)
 *   })
 * })
 *
 * @example
 * // Async iterator streaming
 * const stream = await bot.message.stream(asyncGenerator())
 */
export async function createUniversalStream(
  bot: IBotuiInterface,
  emitter: IEventEmitter,
  source: StreamingSource,
  config: StreamConfig = {}
): Promise<StreamingMessage> {
  const {
    parsers = {},
    parser, // Legacy fallback
    initialData = { text: '' },
    initialMeta,
    eventType = 'message',
    endEvent = 'end',
    maxRetries = 0,
    retryDelay = 1000,
    ...streamingOptions
  } = config

  // Create default parsers with fallback to legacy parser
  const defaultParser = parser || ((data: any) => String(data))

  // Type-safe parser getters
  const sseParser = parsers.sse || defaultParser
  const wsParser = parsers.websocket || ((event: MessageEvent) => defaultParser(event.data))
  const dcParser = parsers.dataChannel || defaultParser
  const iteratorParser = parsers.iterator || defaultParser
  const manualParser = parsers.default || defaultParser

  // Detect source type for better error reporting
  let sourceType = 'unknown'
  if (typeof EventSource !== 'undefined' && source instanceof EventSource) {
    sourceType = 'EventSource'
  } else if (typeof WebSocket !== 'undefined' && source instanceof WebSocket) {
    sourceType = 'WebSocket'
  } else if (typeof RTCDataChannel !== 'undefined' && 'send' in source && 'addEventListener' in source) {
    sourceType = 'RTCDataChannel'
  } else if (Symbol.asyncIterator in source) {
    sourceType = 'AsyncIterable'
  } else if (typeof source === 'function') {
    sourceType = 'Function'
  }

  // Create the streaming message
  const messageKey = await bot.message.add(initialData, initialMeta)
  const streamingMessage = new StreamingMessageImpl(
    bot,
    emitter,
    messageKey,
    sourceType,
    streamingOptions
  )

  // Auto-detect source type and set up streaming
  if (typeof EventSource !== 'undefined' && source instanceof EventSource) {
    // SSE streaming
    const handleMessage = async (event: MessageEvent) => {
      try {
        const text = sseParser(event.data)
        if (text) { // Only append non-empty text
          await streamingMessage.append(text)
        }
      } catch (error) {
        const streamError = new Error(`SSE parsing failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'EventSource'
        })
      }
    }

    if (eventType === 'message') {
      source.onmessage = handleMessage
    } else {
      source.addEventListener(eventType, handleMessage)
    }

    source.addEventListener(endEvent, () => streamingMessage.finish())
    source.addEventListener('error', () => streamingMessage.finish())

    // Cleanup on finish
    const originalFinish = streamingMessage.finish.bind(streamingMessage)
    streamingMessage.finish = async (finalData?, finalMeta?) => {
      source.close()
      return originalFinish(finalData, finalMeta)
    }
  } else if (typeof WebSocket !== 'undefined' && source instanceof WebSocket) {
    // WebSocket streaming
    source.addEventListener('message', async (event) => {
      try {
        const text = wsParser(event)
        if (text) { // Only append non-empty text
          await streamingMessage.append(text)
        }
      } catch (error) {
        const streamError = new Error(`WebSocket parsing failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'WebSocket'
        })
      }
    })

    source.addEventListener('close', () => streamingMessage.finish())
    source.addEventListener('error', () => streamingMessage.finish())
  } else if (
    typeof RTCDataChannel !== 'undefined' &&
    'send' in source &&
    'addEventListener' in source
  ) {
    // RTCDataChannel streaming
    const dataChannel = source as RTCDataChannel

    dataChannel.addEventListener('message', async (event) => {
      try {
        const text = dcParser(event.data)
        if (text) { // Only append non-empty text
          await streamingMessage.append(text)
        }
      } catch (error) {
        const streamError = new Error(`DataChannel parsing failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'RTCDataChannel'
        })
      }
    })

    dataChannel.addEventListener('close', () => streamingMessage.finish())
    dataChannel.addEventListener('error', (event) => {
      const error = new Error(`DataChannel error: ${event}`)
      emitter.emit(EBotUIEvents.STREAM_ERROR, {
        messageKey: messageKey,
        error: error,
        sourceType: 'RTCDataChannel'
      })
      streamingMessage.finish()
    })
  } else if (Symbol.asyncIterator in source) {
    // AsyncIterable streaming (generators, async iterators)
    ;(async () => {
      try {
        for await (const chunk of source as AsyncIterable<string>) {
          const text = iteratorParser(chunk)
          if (text) { // Only append non-empty text
            await streamingMessage.append(text)
          }
        }
      } catch (error) {
        const streamError = new Error(`Iterator streaming failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'AsyncIterable'
        })
      } finally {
        await streamingMessage.finish()
      }
    })()
  } else if (typeof source === 'function') {
    // Manual streaming with callback
    const sourceFunction = source as (
      handler: (text: string) => void
    ) => void | (() => void)
    const cleanup = sourceFunction(async (text: string) => {
      try {
        const parsedText = manualParser(text)
        if (parsedText) { // Only append non-empty text
          await streamingMessage.append(parsedText)
        }
      } catch (error) {
        const streamError = new Error(`Manual streaming parsing failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'Function'
        })
      }
    })

    // If cleanup function returned, call it on finish
    if (typeof cleanup === 'function') {
      const originalFinish = streamingMessage.finish.bind(streamingMessage)
      streamingMessage.finish = async (finalData?, finalMeta?) => {
        cleanup()
        return originalFinish(finalData, finalMeta)
      }
    }
  } else {
    throw new Error('Unsupported streaming source type')
  }

  return streamingMessage
}
