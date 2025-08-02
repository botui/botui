import type { IBotUIEvents, TListener, TEventMap } from './types.js'

export function createEventEmitter() {
  const events: Partial<TEventMap> = {}

  return {
    on<K extends keyof IBotUIEvents>(event: K, listener: TListener<IBotUIEvents[K]>): void {
      if (!events[event]) {
        events[event] = []
      }
      events[event]!.push(listener)
    },

    off<K extends keyof IBotUIEvents>(event: K, listener: TListener<IBotUIEvents[K]>): void {
      const eventListeners = events[event]
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    },

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