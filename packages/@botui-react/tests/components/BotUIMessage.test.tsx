import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../../src/components'
import { Message } from '../../src/hooks/useBotUI'

describe('BotUI.Message', () => {
  it('should render bot message via render prop', () => {
    const botMessage: Message = {
      id: 'msg-1',
      content: 'Hello from bot',
      timestamp: new Date(),
      type: 'bot',
    }

    render(
      <BotUI.Message message={botMessage}>
        {({ content, isHuman }) => (
          <div>
            <span data-testid="content">{content}</span>
            <span data-testid="is-human">{isHuman.toString()}</span>
          </div>
        )}
      </BotUI.Message>
    )

    expect(screen.getByTestId('content')).toHaveTextContent('Hello from bot')
    expect(screen.getByTestId('is-human')).toHaveTextContent('false')
  })

  it('should render human message via render prop', () => {
    const humanMessage: Message = {
      id: 'msg-2',
      content: 'Hello from human',
      timestamp: new Date(),
      type: 'human',
    }

    render(
      <BotUI.Message message={humanMessage}>
        {({ content, isHuman }) => (
          <div>
            <span data-testid="content">{content}</span>
            <span data-testid="is-human">{isHuman.toString()}</span>
          </div>
        )}
      </BotUI.Message>
    )

    expect(screen.getByTestId('content')).toHaveTextContent('Hello from human')
    expect(screen.getByTestId('is-human')).toHaveTextContent('true')
  })

  it('should provide the full message object', () => {
    const message: Message = {
      id: 'msg-3',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
      metadata: { custom: 'data' }
    }

    render(
      <BotUI.Message message={message}>
        {({ message: messageObj }) => (
          <div>
            <span data-testid="message-id">{messageObj.id}</span>
            <span data-testid="message-metadata">{JSON.stringify(messageObj.metadata)}</span>
          </div>
        )}
      </BotUI.Message>
    )

    expect(screen.getByTestId('message-id')).toHaveTextContent('msg-3')
    expect(screen.getByTestId('message-metadata')).toHaveTextContent('{"custom":"data"}')
  })

  it('should pass through additional props', () => {
    const message: Message = {
      id: 'msg-4',
      content: 'Test',
      timestamp: new Date(),
      type: 'bot',
    }

    render(
      <BotUI.Message
        message={message}
        data-testid="message-wrapper"
        className="custom-message"
        style={{ padding: '10px' }}
      >
        {({ content }) => <span>{content}</span>}
      </BotUI.Message>
    )

    const wrapper = screen.getByTestId('message-wrapper')
    expect(wrapper).toHaveClass('custom-message')
    expect(wrapper).toHaveStyle({ padding: '10px' })
  })
})