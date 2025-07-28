import { renderHook, act } from '@testing-library/react'
import { useBotUI, Bot } from '../src/hooks/useBotUI'
import { createMockBot } from './mocks/bot'

describe('useBotUI Hook', () => {
  it('should initialize with empty state', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    expect(result.current.messages).toEqual([])
    expect(result.current.action).toBeNull()
    expect(result.current.isTyping).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should add messages when bot emits message.add', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Simulate bot event listener registration and call the listener
    const messageListener = bot.on.mock.calls.find((call: any) => call[0] === 'message.add')?.[1]

    act(() => {
      messageListener?.({
        id: 'msg-1',
        content: 'Hello',
        timestamp: new Date(),
        type: 'bot'
      })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })

  it('should show actions when bot emits action.show', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Simulate bot event listener registration and call the listener
    const actionListener = bot.on.mock.calls.find((call: any) => call[0] === 'action.show')?.[1]

    act(() => {
      actionListener?.({
        type: 'input',
        id: 'action-1',
        placeholder: 'Enter text'
      })
    })

    expect(result.current.action).toEqual({
      type: 'input',
      id: 'action-1',
      placeholder: 'Enter text'
    })
  })

  it('should resolve actions', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Show action first
    const actionListener = bot.on.mock.calls.find((call: any) => call[0] === 'action.show')?.[1]
    act(() => {
      actionListener?.({
        type: 'input',
        id: 'action-1'
      })
    })

    // Resolve action
    act(() => {
      result.current.resolve({ value: 'test input' })
    })

    expect(bot.emit).toHaveBeenCalledWith('action.resolve', {
      value: 'test input'
    })
    expect(result.current.action).toBeNull()
  })

  it('should handle errors', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Simulate bot event listener registration and call the listener
    const errorListener = bot.on.mock.calls.find((call: any) => call[0] === 'error.occurred')?.[1]

    act(() => {
      errorListener?.({
        type: 'network',
        message: 'Connection failed'
      })
    })

    expect(result.current.error).toEqual({
      type: 'network',
      message: 'Connection failed'
    })
  })

  it('should clear errors', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Set error first
    const errorListener = bot.on.mock.calls.find((call: any) => call[0] === 'error.occurred')?.[1]
    act(() => {
      errorListener?.({
        type: 'network',
        message: 'Connection failed'
      })
    })

    // Clear error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('should handle typing state', () => {
    const bot = createMockBot()
    const { result } = renderHook(() => useBotUI(bot))

    // Simulate bot event listener registration and call the listener
    const typingListener = bot.on.mock.calls.find((call: any) => call[0] === 'typing.set')?.[1]

    act(() => {
      typingListener?.(true)
    })

    expect(result.current.isTyping).toBe(true)

    act(() => {
      typingListener?.(false)
    })

    expect(result.current.isTyping).toBe(false)
  })

  it('should cleanup listeners on unmount', () => {
    const bot = createMockBot()
    const { unmount } = renderHook(() => useBotUI(bot))

    unmount()

    expect(bot.off).toHaveBeenCalledWith('message.add', expect.any(Function))
    expect(bot.off).toHaveBeenCalledWith('action.show', expect.any(Function))
    expect(bot.off).toHaveBeenCalledWith('typing.set', expect.any(Function))
    expect(bot.off).toHaveBeenCalledWith('error.occurred', expect.any(Function))
  })
})