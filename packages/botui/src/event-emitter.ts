import type { IBotUIEvents, TListener, TEventMap } from './types.js'

/**
 * Creates an event emitter for handling BotUI events.
 *
 * @returns {Object} An event emitter object with on, off, and emit methods
 *
 * @example
 * ```typescript
 * import { createEventEmitter } from 'botui'
 *
 * const emitter = createEventEmitter()
 *
 * // Listen to an event
 * emitter.on('message.add', (message) => {
 *   console.log('New message:', message)
 * })
 *
 * // Emit an event
 * emitter.emit('message.add', messageData)
 *
 * // Remove listener
 * emitter.off('message.add', listener)
 * ```
 */
export function createEventEmitter() {
  const events: Partial<TEventMap> = {}

  return {
    /**
     * Registers an event listener for the specified event.
     *
     * @template K - The event type key
     * @param {K} event - The event name to listen to
     * @param {TListener<IBotUIEvents[K]>} listener - The callback function to execute when the event is emitted
     * @returns {void}
     */
    on<K extends keyof IBotUIEvents>(event: K, listener: TListener<IBotUIEvents[K]>): void {
      if (!events[event]) {
        events[event] = []
      }
      events[event]!.push(listener)
    },

    /**
     * Removes an event listener for the specified event.
     *
     * @template K - The event type key
     * @param {K} event - The event name to remove the listener from
     * @param {TListener<IBotUIEvents[K]>} listener - The callback function to remove
     * @returns {void}
     */
    off<K extends keyof IBotUIEvents>(event: K, listener: TListener<IBotUIEvents[K]>): void {
      const eventListeners = events[event]
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    },

    /**
     * Emits an event with the provided data to all registered listeners.
     *
     * @template K - The event type key
     * @param {K} event - The event name to emit
     * @param {IBotUIEvents[K]} data - The data to pass to the event listeners
     * @returns {void}
     */
    emit<K extends keyof IBotUIEvents>(event: K, data: IBotUIEvents[K]): void {
      const eventListeners = events[event]
      if (eventListeners) {
        eventListeners.forEach((listener) => {
          listener(data)
        })
      }
    }
  }
}