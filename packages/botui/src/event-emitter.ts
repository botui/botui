import { BotUIEvents, EventEmitter } from './types.js'

type Listener<T> = (data: T) => void
type EventMap = { [K in keyof BotUIEvents]: Listener<BotUIEvents[K]>[] }

export function createEventEmitter(): EventEmitter {
  const listeners: Partial<EventMap> = {}

  return {
    on<K extends keyof BotUIEvents>(event: K, listener: Listener<BotUIEvents[K]>) {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event]!.push(listener)
    },

    off<K extends keyof BotUIEvents>(event: K, listener: Listener<BotUIEvents[K]>) {
      const eventListeners = listeners[event]
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    },

    emit<K extends keyof BotUIEvents>(event: K, data: BotUIEvents[K]) {
      const eventListeners = listeners[event]
      if (eventListeners) {
        eventListeners.forEach(listener => listener(data))
      }
    },
  }
}