import { Bot } from '../../src/hooks/useBotUI'

// Mock bot implementation for testing
export function createMockBot(): jest.Mocked<Bot> {
  const mockBot = {
    id: 'mock-bot',
    // BotuiInterface methods
    message: {
      add: jest.fn().mockResolvedValue(0),
      setAll: jest.fn().mockResolvedValue([]),
      getAll: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      removeAll: jest.fn().mockResolvedValue(undefined),
    },
    action: {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue({}),
    },
    use: jest.fn().mockReturnThis(),
    next: jest.fn().mockReturnThis(),
    wait: jest.fn().mockResolvedValue({}),
    onChange: jest.fn().mockReturnThis(),
    // Event handling methods
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    destroy: jest.fn(),
  }

  return mockBot as jest.Mocked<Bot>
}