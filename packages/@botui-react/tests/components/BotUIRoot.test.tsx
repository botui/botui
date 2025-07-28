import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../../src/components'
import { createMockBot } from '../mocks/bot'

describe('BotUI.Root', () => {
  it('should render children with context', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot}>
        <div data-testid="child">Child content</div>
      </BotUI.Root>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should handle error boundaries', () => {
    const bot = createMockBot()
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const onError = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <BotUI.Root bot={bot} onError={onError}>
        <ThrowError />
      </BotUI.Root>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    )

    consoleSpy.mockRestore()
  })

  it('should provide accessibility attributes', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root bot={bot} data-testid="botui-root">
        <div>Content</div>
      </BotUI.Root>
    )

    const root = screen.getByTestId('botui-root')
    expect(root).toHaveAttribute('role', 'log')
    expect(root).toHaveAttribute('aria-live', 'polite')
    expect(root).toHaveAttribute('aria-label', 'Chat conversation')
  })

  it('should render fallback UI on error if provided', () => {
    const bot = createMockBot()
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const onError = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <BotUI.Root
        bot={bot}
        onError={onError}
        fallback={<div data-testid="error-fallback">Something went wrong</div>}
      >
        <ThrowError />
      </BotUI.Root>
    )

    expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
    expect(screen.getByTestId('error-fallback')).toHaveTextContent('Something went wrong')

    consoleSpy.mockRestore()
  })

  it('should pass through additional props', () => {
    const bot = createMockBot()

    render(
      <BotUI.Root
        bot={bot}
        data-testid="botui-root"
        className="custom-class"
        style={{ background: 'red' }}
      >
        <div>Content</div>
      </BotUI.Root>
    )

    const root = screen.getByTestId('botui-root')
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveStyle({ background: 'red' })
  })
})