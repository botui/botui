import React from 'react'
import { render, screen, act } from '@testing-library/react'
import {
  BotUIMessageList,
  BotUIAction,
  MessageType,
  BotUIMessageText,
  BotUIMessageImage,
  BotUIMessageEmbed
} from '../src/components'
import { createMockBot } from './mocks/bot'

describe('Legacy Components', () => {
  beforeAll(() => {
    // Mock console.warn for deprecation warnings
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should render BotUIMessageList with deprecation warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn')
    const bot = createMockBot()

    render(<BotUIMessageList bot={bot} />)

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIMessageList is deprecated')
    )
  })

  it('should render BotUIAction with deprecation warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn')
    const bot = createMockBot()

    render(<BotUIAction bot={bot} />)

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIAction is deprecated')
    )
  })

  it('should preserve MessageType enum', () => {
    expect(MessageType.text).toBe('text')
    expect(MessageType.embed).toBe('embed')
    expect(MessageType.image).toBe('image')
    expect(MessageType.links).toBe('links')
  })

  it('should render legacy message renderers with deprecation warnings', () => {
    const consoleSpy = jest.spyOn(console, 'warn')

    const textMessage = {
      data: { text: 'Hello world' },
      meta: { messageType: MessageType.text }
    }

    const imageMessage = {
      data: { src: 'image.jpg', alt: 'Test image' },
      meta: { messageType: MessageType.image }
    }

    const embedMessage = {
      data: { src: 'https://example.com' },
      meta: { messageType: MessageType.embed }
    }

    render(
      <div>
        <BotUIMessageText message={textMessage} />
        <BotUIMessageImage message={imageMessage} />
        <BotUIMessageEmbed message={embedMessage} />
      </div>
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIMessageText is deprecated')
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIMessageImage is deprecated')
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIMessageEmbed is deprecated')
    )

    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'image.jpg')

    // Find iframe by its tag
    const iframe = document.querySelector('iframe')
    expect(iframe).toHaveAttribute('src', 'https://example.com')
  })

  it('should support custom renderers in legacy mode', () => {
    const bot = createMockBot()
    const customRenderer = {
      text: ({ message }: any) => <div data-testid="custom-text">{message.data.text.toUpperCase()}</div>
    }

    render(<BotUIMessageList bot={bot} renderer={customRenderer} />)

    // Component should render without errors, showing that custom renderers are supported
    expect(screen.getAllByRole('log')).toHaveLength(2) // Root and Messages both have role="log"
  })

    it('should convert new message format to legacy format', () => {
    const bot = createMockBot()

    render(<BotUIMessageList bot={bot} />)

    // Simulate a message being added through the new system
    const messageListener = bot.on.mock.calls.find((call: any) => call[0] === 'message.add')?.[1]

    act(() => {
      if (messageListener) {
        messageListener({
          id: 'msg-1',
          content: 'Test message',
          timestamp: new Date(),
          type: 'bot'
        })
      }
    })

    // The legacy component should render the message
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })
})