import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../../src/components'
import { BotUIProvider } from '../../src/context/BotUIContext'
import { createMockBot } from '../mocks/bot'
import { ActionDefinition } from '../../src/hooks/useBotUI'

describe('BotUI.Actions', () => {
  it('should not render when there is no action', () => {
    const bot = createMockBot()
    render(
      <BotUI.Root bot={bot}>
        <BotUI.Actions>
          {() => <div data-testid="action-ui">Action UI</div>}
        </BotUI.Actions>
      </BotUI.Root>
    )
    expect(screen.queryByTestId('action-ui')).not.toBeInTheDocument()
  })

  it('should render action UI when action is present', () => {
    const bot = createMockBot()
    const action: ActionDefinition = { type: 'input', id: 'test-input' }

    render(
      <BotUIProvider bot={bot} action={action}>
        <BotUI.Actions>
          {({ action }) => (
            <div data-testid="action-ui">{action?.id}</div>
          )}
        </BotUI.Actions>
      </BotUIProvider>
    )
    expect(screen.getByTestId('action-ui')).toHaveTextContent('test-input')
  })

  it('should provide resolve function from render prop', () => {
    const bot = createMockBot()
    const action: ActionDefinition = { type: 'input', id: 'test-input' }

    render(
      <BotUIProvider bot={bot} action={action}>
        <BotUI.Actions>
          {({ resolve }) => (
            <button
              data-testid="resolve-btn"
              onClick={() => resolve({ value: 'test' })}
            >
              Resolve
            </button>
          )}
        </BotUI.Actions>
      </BotUIProvider>
    )

    const resolveBtn = screen.getByTestId('resolve-btn')
    expect(resolveBtn).toBeInTheDocument()

    // The button should be clickable (this tests the resolve function is provided)
    resolveBtn.click()
    expect(bot.emit).toHaveBeenCalledWith('action.resolve', { value: 'test' })
  })

  it('should render different action types', () => {
    const bot = createMockBot()
    const selectAction: ActionDefinition = {
      type: 'select',
      id: 'test-select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    }

    render(
      <BotUIProvider bot={bot} action={selectAction}>
        <BotUI.Actions>
          {({ action }) => (
            <div data-testid="action-ui">
              <span data-testid="action-type">{action?.type}</span>
              <span data-testid="options-count">{action?.options?.length}</span>
            </div>
          )}
        </BotUI.Actions>
      </BotUIProvider>
    )

    expect(screen.getByTestId('action-type')).toHaveTextContent('select')
    expect(screen.getByTestId('options-count')).toHaveTextContent('2')
  })

  it('should pass through additional props', () => {
    const bot = createMockBot()
    const action: ActionDefinition = { type: 'input', id: 'test-input' }

    render(
      <BotUIProvider bot={bot} action={action}>
        <BotUI.Actions
          data-testid="actions-wrapper"
          className="custom-actions"
          style={{ margin: '20px' }}
        >
          {({ action }) => <div>{action?.id}</div>}
        </BotUI.Actions>
      </BotUIProvider>
    )

    const wrapper = screen.getByTestId('actions-wrapper')
    expect(wrapper).toHaveClass('custom-actions')
    expect(wrapper).toHaveStyle({ margin: '20px' })
  })
})