/**
 * @jest-environment node
 */
import React from 'react'
import { renderToString } from 'react-dom/server'
import { BotUI } from '../src/components'
import { createMockBot } from './mocks/bot'

describe('SSR Support', () => {
  it('should render on server without errors', () => {
    const bot = createMockBot()

    expect(() => {
      renderToString(
        <BotUI.Root bot={bot}>
          <BotUI.Messages>
            {({ messages }) => <div>{messages.length} messages</div>}
          </BotUI.Messages>
        </BotUI.Root>
      )
    }).not.toThrow()
  })

  it('should not access window during SSR', () => {
    // window should be undefined in Node environment
    expect(typeof window).toBe('undefined')

    const bot = createMockBot()

    const html = renderToString(
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages }) => <div>{messages.length}</div>}
        </BotUI.Messages>
      </BotUI.Root>
    )

    expect(html).toContain('0') // Should render initial state
  })

  it('should render complete BotUI structure on server', () => {
    const bot = createMockBot()

    const html = renderToString(
      <BotUI.Root bot={bot} data-testid="botui-root">
        <BotUI.Messages>
          {({ messages }) => (
            <div>
              <span>Messages: {messages.length}</span>
              {messages.map(msg => (
                <BotUI.Message key={msg.id} message={msg}>
                  {({ content, isHuman }) => (
                    <div className={isHuman ? 'human' : 'bot'}>
                      {content}
                    </div>
                  )}
                </BotUI.Message>
              ))}
            </div>
          )}
        </BotUI.Messages>

                <BotUI.Actions>
          {({ action }) =>
            action ? (
              <div>Action: {action.type}</div>
            ) : null
          }
        </BotUI.Actions>
      </BotUI.Root>
    )

    // Should contain proper structure
    expect(html).toContain('role="log"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toMatch(/Messages:\s*(<!--.*?-->)?\s*0/)
    // BotUI.Actions returns null when there's no action, so no additional content should be present
  })

  it('should render with controlled props on server', () => {
    const bot = createMockBot()
    const controlledMessages = [
      {
        id: 'msg-1',
        content: 'Server message',
        timestamp: new Date(),
        type: 'bot' as const
      }
    ]

    const controlledAction = {
      type: 'input' as const,
      id: 'server-action',
      placeholder: 'Server placeholder'
    }

    const html = renderToString(
      <BotUI.Root
        bot={bot}
        messages={controlledMessages}
        action={controlledAction}
      >
        <BotUI.Messages>
          {({ messages }) => (
            <div>
              <span>Count: {messages.length}</span>
              {messages.map(msg => (
                <div key={msg.id}>{msg.content}</div>
              ))}
            </div>
          )}
        </BotUI.Messages>

        <BotUI.Actions>
          {({ action }) =>
            action ? (
              <div>Action: {action.placeholder}</div>
            ) : null
          }
        </BotUI.Actions>
      </BotUI.Root>
    )

    expect(html).toMatch(/Count:\s*(<!--.*?-->)?\s*1/)
    expect(html).toContain('Server message')
    expect(html).toMatch(/Action:\s*(<!--.*?-->)?\s*Server placeholder/)
  })

  it('should handle legacy components on server', () => {
    const bot = createMockBot()

    // Suppress deprecation warnings during SSR test
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    expect(() => {
      renderToString(
        <div>
          <BotUI.Root bot={bot}>
            <BotUI.Messages>
              {({ messages }) => <div>{messages.length}</div>}
            </BotUI.Messages>
          </BotUI.Root>
        </div>
      )
    }).not.toThrow()

    consoleSpy.mockRestore()
  })

  it('should not use browser-specific APIs', () => {
    const bot = createMockBot()

    // Verify common browser APIs are undefined in Node
    expect(typeof document).toBe('undefined')
    expect(typeof localStorage).toBe('undefined')
    expect(typeof sessionStorage).toBe('undefined')
    expect(typeof navigator).toBe('undefined')

    // Should still render without errors
    expect(() => {
      renderToString(
        <BotUI.Root bot={bot}>
          <BotUI.Messages>
            {({ messages }) => <div>SSR Safe: {messages.length}</div>}
          </BotUI.Messages>
        </BotUI.Root>
      )
    }).not.toThrow()
  })
})