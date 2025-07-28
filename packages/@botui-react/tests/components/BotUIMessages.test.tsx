import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { BotUI } from '../../src/components'
import { createMockBot } from '../mocks/bot'

describe('BotUI.Messages', () => {
  it('should render messages using render prop', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages }) => (
            <div data-testid="messages-container">
              {messages.map(msg => (
                <div key={msg.id} data-testid="message">
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </BotUI.Messages>
      </BotUI.Root>
    )

    expect(screen.getByTestId('messages-container')).toBeInTheDocument()
  })

  it('should update when new messages are added', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages }) => (
            <div>
              {messages.map(msg => (
                <div key={msg.id} data-testid="message">
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </BotUI.Messages>
      </BotUI.Root>
    )

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

    expect(screen.getByTestId('message')).toHaveTextContent('Hello')
  })

  it('should provide accessibility attributes', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages data-testid="messages">
          {({ messages }) => <div>{messages.length} messages</div>}
        </BotUI.Messages>
      </BotUI.Root>
    )

    const messages = screen.getByTestId('messages')
    expect(messages).toHaveAttribute('role', 'log')
    expect(messages).toHaveAttribute('aria-live', 'polite')
    expect(messages).toHaveAttribute('aria-label', 'Chat messages')
  })

  it('should pass through additional props', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages
          data-testid="messages"
          className="custom-messages"
          style={{ border: '1px solid red' }}
        >
          {({ messages }) => <div>{messages.length} messages</div>}
        </BotUI.Messages>
      </BotUI.Root>
    )

    const messages = screen.getByTestId('messages')
    expect(messages).toHaveClass('custom-messages')
    expect(messages).toHaveStyle({ border: '1px solid red' })
  })
})