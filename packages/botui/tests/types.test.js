import { expect } from '@jest/globals'

describe('TypeScript Contracts', () => {
  describe('Bot Interface', () => {
    test('should define required bot methods', () => {
      // Mock bot implementation to verify interface concept
      const mockBot = {
        id: 'test-bot',
        message: () => Promise.resolve(),
        action: () => Promise.resolve({ value: 'test' }),
        destroy: () => {},
        // EventEmitter methods
        on: () => {},
        off: () => {},
        emit: () => {},
      }

      expect(mockBot.id).toBe('test-bot')
      expect(typeof mockBot.message).toBe('function')
      expect(typeof mockBot.action).toBe('function')
      expect(typeof mockBot.destroy).toBe('function')
      expect(typeof mockBot.on).toBe('function')
      expect(typeof mockBot.off).toBe('function')
      expect(typeof mockBot.emit).toBe('function')
    })
  })

  describe('Message Interface', () => {
    test('should define message structure', () => {
      const message = {
        id: 'msg-1',
        content: 'Hello world',
        timestamp: new Date(),
        type: 'bot',
      }

      expect(message.id).toBeDefined()
      expect(message.content).toBeDefined()
      expect(message.type).toMatch(/^(bot|human)$/)
      expect(message.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('Action Interface', () => {
    test('should define action structure', () => {
      const inputAction = {
        type: 'input',
        id: 'action-1',
        placeholder: 'Enter text',
      }

      const selectAction = {
        type: 'select',
        id: 'action-2',
        options: [
          { value: 'option1', label: 'Option 1' }
        ],
      }

      expect(inputAction.type).toBe('input')
      expect(inputAction.id).toBe('action-1')
      expect(selectAction.type).toBe('select')
      expect(selectAction.options).toBeDefined()
      expect(Array.isArray(selectAction.options)).toBe(true)
    })
  })

  describe('BotUIError Interface', () => {
    test('should define error structure', () => {
      const error = {
        type: 'network',
        message: 'Connection failed',
        cause: new Error('Network timeout'),
        actionId: 'action-1'
      }

      expect(error.type).toMatch(/^(network|validation|bot-script|unexpected)$/)
      expect(error.message).toBe('Connection failed')
      expect(error.cause).toBeInstanceOf(Error)
      expect(error.actionId).toBe('action-1')
    })
  })
})