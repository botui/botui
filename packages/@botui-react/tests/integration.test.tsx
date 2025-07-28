import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BotUI } from '../src/components'
import { useBotUIContext } from '../src/context/BotUIContext'
import { createMockBot } from './mocks/bot'

describe('Integration Tests', () => {
  it('should handle complete conversation flow', async () => {
    const user = userEvent.setup()
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages }) => (
            <div data-testid="messages">
              {messages.map(msg => (
                <div key={msg.id} data-testid={`message-${msg.type}`}>
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </BotUI.Messages>

        <BotUI.Actions>
          {({ action, resolve }) => {
            if (action?.type === 'input') {
              return (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const value = formData.get('userInput') as string
                  resolve({ value })
                  ;(e.target as HTMLFormElement).reset()
                }}>
                  <input
                    name="userInput"
                    data-testid="input"
                    placeholder={action.placeholder}
                  />
                  <button type="submit" data-testid="submit">Send</button>
                </form>
              )
            }
            return null
          }}
        </BotUI.Actions>
      </BotUI.Root>
    )

    // Bot sends message
    const messageListener = bot.on.mock.calls.find((call: any) => call[0] === 'message.add')?.[1]

    act(() => {
      messageListener?.({
        id: 'msg-1',
        content: 'Hello! What is your name?',
        timestamp: new Date(),
        type: 'bot'
      })
    })

    expect(screen.getByTestId('message-bot')).toHaveTextContent('Hello! What is your name?')

    // Bot shows input action
    const actionListener = bot.on.mock.calls.find((call: any) => call[0] === 'action.show')?.[1]

    act(() => {
      actionListener?.({
        type: 'input',
        id: 'name-input',
        placeholder: 'Enter your name'
      })
    })

    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')

    // User types and submits
    await user.type(input, 'John')
    await user.click(screen.getByTestId('submit'))

    expect(bot.emit).toHaveBeenCalledWith('action.resolve', {
      value: 'John'
    })
  })

  it('should handle error recovery', async () => {
    const bot = createMockBot()

    function ErrorDisplay() {
      const { error, clearError } = useBotUIContext()
      return error ? (
        <div data-testid="error">
          {error.message}
          <button onClick={clearError} data-testid="clear-error">
            Dismiss
          </button>
        </div>
      ) : null
    }

    render(
      <BotUI.Root bot={bot}>
        <ErrorDisplay />
        <BotUI.Messages>
          {({ messages }) => (
            <div>
              {messages.map(msg => (
                <div key={msg.id}>{msg.content}</div>
              ))}
            </div>
          )}
        </BotUI.Messages>
      </BotUI.Root>
    )

    // Emit error
    const errorListener = bot.on.mock.calls.find((call: any) => call[0] === 'error.occurred')?.[1]

    act(() => {
      errorListener?.({
        type: 'network',
        message: 'Connection failed'
      })
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Connection failed')

    // Clear error
    fireEvent.click(screen.getByTestId('clear-error'))

    await waitFor(() => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })

  it('should handle typing indicators', async () => {
    const bot = createMockBot()

    function TypingIndicator() {
      const { isTyping } = useBotUIContext()
      return (
        <div data-testid="typing-indicator">
          {isTyping ? 'Bot is typing...' : 'Bot is idle'}
        </div>
      )
    }

    render(
      <BotUI.Root bot={bot}>
        <TypingIndicator />
      </BotUI.Root>
    )

    expect(screen.getByTestId('typing-indicator')).toHaveTextContent('Bot is idle')

    // Simulate typing
    const typingListener = bot.on.mock.calls.find((call: any) => call[0] === 'typing.set')?.[1]

    act(() => {
      typingListener?.(true)
    })

    expect(screen.getByTestId('typing-indicator')).toHaveTextContent('Bot is typing...')

    act(() => {
      typingListener?.(false)
    })

    expect(screen.getByTestId('typing-indicator')).toHaveTextContent('Bot is idle')
  })

  it('should handle select actions', async () => {
    const user = userEvent.setup()
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Actions>
          {({ action, resolve }) => {
            if (action?.type === 'select') {
              return (
                <div data-testid="select-action">
                  {action.options?.map(option => (
                    <button
                      key={option.value}
                      data-testid={`option-${option.value}`}
                      onClick={() => resolve({ value: option.value, option })}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )
            }
            return null
          }}
        </BotUI.Actions>
      </BotUI.Root>
    )

    // Show select action
    const actionListener = bot.on.mock.calls.find((call: any) => call[0] === 'action.show')?.[1]

    act(() => {
      actionListener?.({
        type: 'select',
        id: 'color-select',
        options: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue', disabled: true },
          { value: 'green', label: 'Green' }
        ]
      })
    })

    expect(screen.getByTestId('select-action')).toBeInTheDocument()
    expect(screen.getByTestId('option-red')).toBeEnabled()
    expect(screen.getByTestId('option-blue')).toBeDisabled()
    expect(screen.getByTestId('option-green')).toBeEnabled()

    // Select an option
    await user.click(screen.getByTestId('option-red'))

    expect(bot.emit).toHaveBeenCalledWith('action.resolve', {
      value: 'red',
      option: { value: 'red', label: 'Red' }
    })
  })

  it('should support controlled mode', () => {
    const bot = createMockBot()
    const controlledMessages = [
      {
        id: 'msg-1',
        content: 'Controlled message 1',
        timestamp: new Date(),
        type: 'bot' as const
      },
      {
        id: 'msg-2',
        content: 'Controlled message 2',
        timestamp: new Date(),
        type: 'human' as const
      }
    ]

    const controlledAction = {
      type: 'input' as const,
      id: 'controlled-input',
      placeholder: 'Controlled placeholder'
    }

    render(
      <BotUI.Root
        bot={bot}
        messages={controlledMessages}
        action={controlledAction}
        isTyping={true}
      >
        <BotUI.Messages>
          {({ messages }) => {
            const { isTyping } = useBotUIContext()
            return (
              <div>
                <div data-testid="messages-count">{messages.length}</div>
                <div data-testid="typing-status">{isTyping ? 'typing' : 'idle'}</div>
                {messages.map(msg => (
                  <div key={msg.id} data-testid={`message-${msg.type}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
            )
          }}
        </BotUI.Messages>

        <BotUI.Actions>
          {({ action }) => (
            <div data-testid="action-placeholder">
              {action?.placeholder}
            </div>
          )}
        </BotUI.Actions>
      </BotUI.Root>
    )

    expect(screen.getByTestId('messages-count')).toHaveTextContent('2')
    expect(screen.getByTestId('typing-status')).toHaveTextContent('typing')
    expect(screen.getByTestId('action-placeholder')).toHaveTextContent('Controlled placeholder')
    expect(screen.getByTestId('message-bot')).toHaveTextContent('Controlled message 1')
    expect(screen.getByTestId('message-human')).toHaveTextContent('Controlled message 2')
  })
})