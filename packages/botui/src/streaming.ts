import type {
  IBotuiInterface,
  TBlockData,
  TBlockMeta,
  IEventEmitter,
} from './types.js'
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
  /** When to execute plugins during streaming (default: 'final') */
  pluginExecution?: 'always' | 'final' | 'interval' | 'manual'
  /** Interval for plugin execution in milliseconds when pluginExecution is 'interval' (default: 500ms) */
  pluginInterval?: number
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
  getState(): {
    text: string
    data: TBlockData
    status: string
    updateCount: number
  }

  /** Manually trigger plugin execution (only works when pluginExecution is 'manual') */
  triggerPlugins(): Promise<void>
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
  private _status: 'streaming' | 'finished' | 'cancelled' | 'error' =
    'streaming'
  private updateCount = 0
  private startTime = Date.now()
  private isPaused = false
  private cachedBlock: any = null // Cache for fast path
  private sourceType: string = 'unknown'
  private lastPluginExecutionTime = 0
  private pluginTimer: NodeJS.Timeout | null = null

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
      pluginExecution: 'final', // Execute plugins only on final update by default
      pluginInterval: 500, // Execute plugins every 500ms when using interval timing
      ...options,
    }

    // Emit stream start event
    this.emitter.emit(EBotUIEvents.STREAM_START, {
      messageKey: this.key,
      sourceType: this.sourceType,
    })

    // Emit busy state when streaming starts
    this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: true, source: 'bot' })

    // Setup plugin interval timer if using interval timing
    if (this.getPluginExecution() === 'interval') {
      this.startPluginInterval()
    }
  }

  get status(): 'streaming' | 'finished' | 'cancelled' | 'error' {
    return this._status
  }

  /**
   * Get the plugin execution mode
   */
  private getPluginExecution(): 'always' | 'final' | 'interval' | 'manual' {
    return this.options.pluginExecution!
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

    // Clear any pending updates and plugin timers
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }
    this.stopPluginInterval()

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
        duration: Date.now() - this.startTime,
      })

      // Clear busy state when streaming completes
      this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })
    } catch (error) {
      this._status = 'error'

      // Emit error event
      this.emitter.emit(EBotUIEvents.STREAM_ERROR, {
        messageKey: this.key,
        error: error as Error,
        sourceType: this.sourceType,
      })

      // Clear busy state when streaming encounters an error
      this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })

      throw error
    }
  }

  async cancel(reason?: string): Promise<void> {
    if (this._status !== 'streaming') return
    this._status = 'cancelled'

    // Clear any pending updates and plugin timers
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }
    this.stopPluginInterval()

    // Emit cancel event
    this.emitter.emit(EBotUIEvents.STREAM_CANCEL, {
      messageKey: this.key,
      reason,
    })

    // Clear busy state when streaming is cancelled
    this.emitter.emit(EBotUIEvents.BOT_BUSY, { busy: false, source: 'bot' })

    // Update message to indicate cancellation
    try {
      await this.bot.message.update(this.key, {
        ...this.pendingData,
        cancelled: true,
        cancelReason: reason,
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

  getState(): {
    text: string
    data: TBlockData
    status: string
    updateCount: number
  } {
    return {
      text: this.currentText,
      data: { ...this.pendingData },
      status: this._status,
      updateCount: this.updateCount,
    }
  }

  async triggerPlugins(): Promise<void> {
    if (this._status !== 'streaming') {
      throw new Error('Cannot trigger plugins when not streaming')
    }

    const pluginMode = this.getPluginExecution()
    if (pluginMode !== 'manual') {
      throw new Error(
        `Manual plugin triggering only works when pluginExecution is set to 'manual' (current: '${pluginMode}')`
      )
    }

    return this.executePluginsIfNeeded()
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

  private startPluginInterval(): void {
    if (this.pluginTimer) {
      clearTimeout(this.pluginTimer)
    }
    this.lastPluginExecutionTime = Date.now()
    this.scheduleNextPluginExecution()
  }

  private stopPluginInterval(): void {
    if (this.pluginTimer) {
      clearTimeout(this.pluginTimer)
      this.pluginTimer = null
    }
  }

  private scheduleNextPluginExecution(): void {
    if (this._status !== 'streaming') {
      return
    }

    this.pluginTimer = setTimeout(async () => {
      await this.executePluginsIfNeeded()
      // Schedule next execution only if still streaming
      if (this._status === 'streaming') {
        this.scheduleNextPluginExecution()
      }
    }, this.options.pluginInterval)
  }

  private shouldRunPlugins(forceFull: boolean): boolean {
    // Always run plugins if explicitly forced (e.g., final update)
    if (forceFull) {
      return true
    }

    // Check the resolved plugin execution mode
    const pluginMode = this.getPluginExecution()

    switch (pluginMode) {
      case 'always':
        // Run plugins on every update
        return true

      case 'final':
        // Only run plugins on forceFull (handled above)
        return false

      case 'interval':
        // For interval timing, plugins are handled by the separate interval timer
        // Regular updates should NOT run plugins in this mode
        return false

      case 'manual':
        // Manual mode: plugins only run when explicitly triggered
        return false

      default:
        return false
    }
  }

  private async executePluginsIfNeeded(): Promise<void> {
    if (
      this._status !== 'streaming' ||
      Object.keys(this.pendingData).length === 0
    ) {
      return
    }

    try {
      // Execute plugins with current pending data
      await this.bot.message.update(
        this.key,
        this.pendingData,
        Object.keys(this.pendingMeta).length > 0 ? this.pendingMeta : undefined
      )

      this.lastPluginExecutionTime = Date.now()
      this.updateCount++
      this.lastUpdateTime = Date.now()

      // Clear pending data after plugin execution
      this.pendingData = { text: this.currentText } // Keep current text
      this.pendingMeta = {}

      // Clear cached block since plugins may have modified it
      this.cachedBlock = null
    } catch (error) {
      console.error('Plugin execution failed during interval:', error)
    }
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
      const shouldRunPlugins = this.shouldRunPlugins(forceFull)

      if (shouldRunPlugins) {
        // Full update with plugins
        await this.bot.message.update(
          this.key,
          this.pendingData,
          Object.keys(this.pendingMeta).length > 0
            ? this.pendingMeta
            : undefined
        )

        // Track plugin execution time for interval timing
        if (this.getPluginExecution() === 'interval') {
          this.lastPluginExecutionTime = Date.now()
        }
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
        duration,
      })
    } catch (error) {
      this._status = 'error'

      // Emit error event
      this.emitter.emit(EBotUIEvents.STREAM_ERROR, {
        messageKey: this.key,
        error: error as Error,
        sourceType: this.sourceType,
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
 * Event configuration for event-based streaming sources
 */
export interface StreamingEventConfig {
  /** Event type for data messages (default: 'message') */
  dataEvent?: string
  /** Event type for stream completion (default: 'end' for SSE, 'close' for WS/RTC) */
  endEvent?: string
  /** Event type for errors (default: 'error') */
  errorEvent?: string
  /** Custom event handlers for additional events */
  customEvents?: Record<string, (event: any) => void>
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
  /** Event configuration per streaming type */
  events?: {
    sse?: StreamingEventConfig
    websocket?: StreamingEventConfig
    dataChannel?: StreamingEventConfig
  }
  /** Retry failed connections (default: 0) */
  maxRetries?: number
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number
}

/**
 * Universal streaming method - handles all streaming scenarios
 *
 * @example
 * // SSE streaming with default events
 * const stream = await bot.message.stream(new EventSource('/api/chat'))
 *
 * @example
 * // SSE streaming with custom events
 * const stream = await bot.message.stream(eventSource, {
 *   events: {
 *     sse: {
 *       dataEvent: 'chat-message',
 *       endEvent: 'chat-complete',
 *       customEvents: {
 *         'heartbeat': (event) => console.log('Heartbeat received')
 *       }
 *     }
 *   }
 * })
 *
 * @example
 * // WebSocket streaming with custom events
 * const stream = await bot.message.stream(websocket, {
 *   parsers: {
 *     websocket: (event) => JSON.parse(event.data).content
 *   },
 *   events: {
 *     websocket: {
 *       dataEvent: 'text-chunk',
 *       endEvent: 'stream-done'
 *     }
 *   }
 * })
 *
 * @example
 * // RTCDataChannel streaming with custom events
 * const stream = await bot.message.stream(dataChannel, {
 *   events: {
 *     dataChannel: {
 *       dataEvent: 'message',
 *       endEvent: 'datachannel-close',
 *       customEvents: {
 *         'status': (event) => console.log('Status update:', event.data)
 *       }
 *     }
 *   }
 * })
 *
 * @example
 * // Manual streaming (no event configuration needed)
 * const stream = await bot.message.stream((emit) => {
 *   fetch('/api/stream').then(response => {
 *     const reader = response.body.getReader()
 *     // ... read chunks and call emit(chunk)
 *   })
 * })
 *
 * @example
 * // Async iterator streaming (no event configuration needed)
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
    events = {},
    maxRetries = 0,
    retryDelay = 1000,
    ...streamingOptions
  } = config

  // Create default parsers with fallback to legacy parser
  const defaultParser = parser || ((data: any) => String(data))

  // Type-safe parser getters
  const sseParser = parsers.sse || defaultParser
  const wsParser =
    parsers.websocket || ((event: MessageEvent) => defaultParser(event.data))
  const dcParser = parsers.dataChannel || defaultParser
  const iteratorParser = parsers.iterator || defaultParser
  const manualParser = parsers.default || defaultParser

  // Event configuration with defaults for each streaming type
  const sseEvents = {
    dataEvent: 'message',
    endEvent: 'end',
    errorEvent: 'error',
    customEvents: {},
    ...events.sse,
  }

  const websocketEvents = {
    dataEvent: 'message',
    endEvent: 'close',
    errorEvent: 'error',
    customEvents: {},
    ...events.websocket,
  }

  const dataChannelEvents = {
    dataEvent: 'message',
    endEvent: 'close',
    errorEvent: 'error',
    customEvents: {},
    ...events.dataChannel,
  }

  // Detect source type for better error reporting
  let sourceType = 'unknown'
  if (typeof EventSource !== 'undefined' && source instanceof EventSource) {
    sourceType = 'EventSource'
  } else if (typeof WebSocket !== 'undefined' && source instanceof WebSocket) {
    sourceType = 'WebSocket'
  } else if (
    typeof RTCDataChannel !== 'undefined' &&
    'send' in source &&
    'addEventListener' in source
  ) {
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
        if (text) {
          // Only append non-empty text
          await streamingMessage.append(text)
        }
      } catch (error) {
        const streamError = new Error(`SSE parsing failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'EventSource',
        })
      }
    }

    // Set up data event listener
    if (sseEvents.dataEvent === 'message') {
      source.onmessage = handleMessage
    } else {
      source.addEventListener(sseEvents.dataEvent, handleMessage)
    }

    // Set up completion and error listeners
    source.addEventListener(sseEvents.endEvent, () => streamingMessage.finish())
    source.addEventListener(sseEvents.errorEvent, () =>
      streamingMessage.finish()
    )

    // Set up custom event listeners
    Object.entries(sseEvents.customEvents).forEach(([eventName, handler]) => {
      source.addEventListener(eventName, handler)
    })

    // Cleanup on finish
    const originalFinish = streamingMessage.finish.bind(streamingMessage)
    streamingMessage.finish = async (finalData?, finalMeta?) => {
      source.close()
      return originalFinish(finalData, finalMeta)
    }
  } else if (typeof WebSocket !== 'undefined' && source instanceof WebSocket) {
    // WebSocket streaming
    source.addEventListener(
      websocketEvents.dataEvent,
      async (event: MessageEvent) => {
        try {
          const text = wsParser(event)
          if (text) {
            // Only append non-empty text
            await streamingMessage.append(text)
          }
        } catch (error) {
          const streamError = new Error(`WebSocket parsing failed: ${error}`)
          emitter.emit(EBotUIEvents.STREAM_ERROR, {
            messageKey: messageKey,
            error: streamError,
            sourceType: 'WebSocket',
          })
        }
      }
    )

    // Set up completion and error listeners
    source.addEventListener(websocketEvents.endEvent, () =>
      streamingMessage.finish()
    )
    source.addEventListener(websocketEvents.errorEvent, () =>
      streamingMessage.finish()
    )

    // Set up custom event listeners
    Object.entries(websocketEvents.customEvents).forEach(
      ([eventName, handler]) => {
        source.addEventListener(eventName, handler)
      }
    )
  } else if (
    typeof RTCDataChannel !== 'undefined' &&
    'send' in source &&
    'addEventListener' in source
  ) {
    // RTCDataChannel streaming
    const dataChannel = source as RTCDataChannel

    dataChannel.addEventListener(
      dataChannelEvents.dataEvent,
      async (event: MessageEvent) => {
        try {
          const text = dcParser(event.data)
          if (text) {
            // Only append non-empty text
            await streamingMessage.append(text)
          }
        } catch (error) {
          const streamError = new Error(`DataChannel parsing failed: ${error}`)
          emitter.emit(EBotUIEvents.STREAM_ERROR, {
            messageKey: messageKey,
            error: streamError,
            sourceType: 'RTCDataChannel',
          })
        }
      }
    )

    // Set up completion and error listeners
    dataChannel.addEventListener(dataChannelEvents.endEvent, () =>
      streamingMessage.finish()
    )
    dataChannel.addEventListener(
      dataChannelEvents.errorEvent,
      (event: Event) => {
        const error = new Error(`DataChannel error: ${event.type}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: error,
          sourceType: 'RTCDataChannel',
        })
        streamingMessage.finish()
      }
    )

    // Set up custom event listeners
    Object.entries(dataChannelEvents.customEvents).forEach(
      ([eventName, handler]) => {
        dataChannel.addEventListener(eventName, handler)
      }
    )
  } else if (Symbol.asyncIterator in source) {
    // AsyncIterable streaming (generators, async iterators)
    ;(async () => {
      try {
        for await (const chunk of source as AsyncIterable<string>) {
          const text = iteratorParser(chunk)
          if (text) {
            // Only append non-empty text
            await streamingMessage.append(text)
          }
        }
      } catch (error) {
        const streamError = new Error(`Iterator streaming failed: ${error}`)
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'AsyncIterable',
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
        if (parsedText) {
          // Only append non-empty text
          await streamingMessage.append(parsedText)
        }
      } catch (error) {
        const streamError = new Error(
          `Manual streaming parsing failed: ${error}`
        )
        emitter.emit(EBotUIEvents.STREAM_ERROR, {
          messageKey: messageKey,
          error: streamError,
          sourceType: 'Function',
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
