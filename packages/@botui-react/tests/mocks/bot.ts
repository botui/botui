import { Bot } from '../../src/hooks/useBotUI'

// Mock bot implementation for testing
export function createMockBot(): jest.Mocked<Bot> {
  const mockBot = {
    id: 'mock-bot',
    message: jest.fn(),
    action: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  }

  return mockBot as jest.Mocked<Bot>
}