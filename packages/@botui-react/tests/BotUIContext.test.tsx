import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUIProvider, useBotUIContext } from '../src/context/BotUIContext'
import { createMockBot } from './mocks/bot'

function TestComponent() {
  const context = useBotUIContext()
  return (
    <div>
      <span data-testid="bot-id">{context.bot.id}</span>
      <span data-testid="messages-count">{context.messages.length}</span>
      <span data-testid="is-typing">{context.isTyping.toString()}</span>
      <span data-testid="has-action">{context.action ? 'true' : 'false'}</span>
      <span data-testid="has-error">{context.error ? 'true' : 'false'}</span>
    </div>
  )
}

describe('BotUI Context', () => {
  it('should provide bot and state to children', () => {
    const bot = createMockBot()

    render(
      <BotUIProvider bot={bot}>
        <TestComponent />
      </BotUIProvider>
    )

    expect(screen.getByTestId('bot-id')).toHaveTextContent('mock-bot')
    expect(screen.getByTestId('messages-count')).toHaveTextContent('0')
    expect(screen.getByTestId('is-typing')).toHaveTextContent('false')
    expect(screen.getByTestId('has-action')).toHaveTextContent('false')
    expect(screen.getByTestId('has-error')).toHaveTextContent('false')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useBotUIContext must be used within a BotUIProvider')

    consoleSpy.mockRestore()
  })

  it('should handle controlled mode', () => {
    const bot = createMockBot()
    const controlledMessages = [
      {
        id: 'msg-1',
        content: 'Controlled message',
        timestamp: new Date(),
        type: 'bot' as const
      }
    ]

    const controlledAction = {
      type: 'input' as const,
      id: 'controlled-action',
      placeholder: 'Enter something'
    }

    render(
      <BotUIProvider
        bot={bot}
        messages={controlledMessages}
        action={controlledAction}
        isTyping={true}
      >
        <TestComponent />
      </BotUIProvider>
    )

    expect(screen.getByTestId('messages-count')).toHaveTextContent('1')
    expect(screen.getByTestId('has-action')).toHaveTextContent('true')
    expect(screen.getByTestId('is-typing')).toHaveTextContent('true')
  })

  it('should call change handlers in controlled mode', () => {
    const bot = createMockBot()
    const onMessagesChange = jest.fn()
    const onActionChange = jest.fn()
    const onTypingChange = jest.fn()
    const onErrorChange = jest.fn()

    render(
      <BotUIProvider
        bot={bot}
        onMessagesChange={onMessagesChange}
        onActionChange={onActionChange}
        onTypingChange={onTypingChange}
        onErrorChange={onErrorChange}
      >
        <TestComponent />
      </BotUIProvider>
    )

    // The hooks should call the change handlers with initial state
    expect(onMessagesChange).toHaveBeenCalledWith([])
    expect(onActionChange).toHaveBeenCalledWith(null)
    expect(onTypingChange).toHaveBeenCalledWith(false)
    expect(onErrorChange).toHaveBeenCalledWith(null)
  })

  it('should provide resolve and clearError functions', () => {
    const bot = createMockBot()

    function TestComponentWithActions() {
      const { resolve, clearError } = useBotUIContext()

      return (
        <div>
          <button
            data-testid="resolve-btn"
            onClick={() => resolve({ value: 'test' })}
          >
            Resolve
          </button>
          <button
            data-testid="clear-error-btn"
            onClick={() => clearError()}
          >
            Clear Error
          </button>
        </div>
      )
    }

    render(
      <BotUIProvider bot={bot}>
        <TestComponentWithActions />
      </BotUIProvider>
    )

    const resolveBtn = screen.getByTestId('resolve-btn')
    const clearErrorBtn = screen.getByTestId('clear-error-btn')

    expect(resolveBtn).toBeInTheDocument()
    expect(clearErrorBtn).toBeInTheDocument()

    // These shouldn't throw
    resolveBtn.click()
    clearErrorBtn.click()
  })
})