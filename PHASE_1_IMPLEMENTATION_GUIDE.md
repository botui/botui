# BotUI Headless Migration - Phase 1 Implementation Guide

## Overview

This document provides step-by-step instructions for implementing Phase 1 of the BotUI headless migration. We follow a **test-driven development (TDD)** approach with strict **forward and backward compatibility** requirements.

## Implementation Principles

### 1. Test-Driven Development (TDD)
- **Write tests FIRST** for every new feature/change
- **Run tests AFTER** every change to ensure nothing breaks
- Maintain **100% test coverage** for new code
- Tests serve as **living documentation** of API behavior

### 2. Compatibility Strategy
- **Forward Compatibility**: New API designed to avoid future breaking changes
- **Backward Compatibility**: Existing API continues to work with deprecation warnings
- **Gradual Migration**: Users can adopt new features incrementally

### 3. Risk Mitigation
- **Feature Flags**: Enable/disable new features during development
- **Canary Testing**: Test with subset of users before full rollout
- **Rollback Plan**: Ability to revert changes if issues arise

## Phase 1 Scope

### Core Deliverables
1. **TypeScript Contracts** - Public interface definitions
2. **Event Emitter Integration** - Core state management
3. **BotUI.Root** - Context provider and state management
4. **BotUI.Messages** - Message list with render props
5. **BotUI.Message** - Individual message component
6. **BotUI.Actions** - Action handler component
7. **useBotUI Hook** - Direct hook access
8. **Error Boundaries** - Graceful error handling
9. **SSR Support** - Server-side rendering compatibility

### Testing Requirements
- **Unit Tests**: Every component, hook, and utility
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows
- **SSR Tests**: Server-side rendering compatibility
- **Performance Tests**: Bundle size and runtime performance

## Step-by-Step Implementation

### Step 1: Project Setup and TypeScript Contracts

#### 1.1 Update botui Core Package

**Location**: `packages/botui/`

**Test First**:
```bash
# Create new test file
touch packages/botui/tests/types.test.ts
```

**Test Implementation**:
```typescript
// packages/botui/tests/types.test.ts
import { Bot, Message, ActionDefinition, BotUIError } from '../src/types'

describe('TypeScript Contracts', () => {
  describe('Bot Interface', () => {
    it('should define required bot methods', () => {
      // Mock bot implementation to verify interface
      const mockBot: Bot = {
        id: 'test-bot',
        message: jest.fn(),
        action: jest.fn(),
        destroy: jest.fn(),
        // EventEmitter methods
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      }

      expect(mockBot.id).toBe('test-bot')
      expect(typeof mockBot.message).toBe('function')
      expect(typeof mockBot.action).toBe('function')
      expect(typeof mockBot.destroy).toBe('function')
    })
  })

  describe('Message Interface', () => {
    it('should define message structure', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Hello world',
        timestamp: new Date(),
        type: 'bot',
      }

      expect(message.id).toBeDefined()
      expect(message.content).toBeDefined()
      expect(message.type).toMatch(/^(bot|human)$/)
    })
  })

  describe('Action Interface', () => {
    it('should define action structure', () => {
      const inputAction: ActionDefinition = {
        type: 'input',
        id: 'action-1',
        placeholder: 'Enter text',
      }

      const selectAction: ActionDefinition = {
        type: 'select',
        id: 'action-2',
        options: [
          { value: 'option1', label: 'Option 1' }
        ],
      }

      expect(inputAction.type).toBe('input')
      expect(selectAction.type).toBe('select')
      expect(selectAction.options).toBeDefined()
    })
  })
})
```

**Implementation**:
```typescript
// packages/botui/src/types.ts
export type MessageId = string
export type ActionId = string

export interface Bot extends EventEmitter {
  readonly id: string
  message(content: MessageContent): Promise<void>
  action(actionDef: ActionDefinition): Promise<ActionResult>
  destroy(): void
}

export interface Message {
  readonly id: MessageId
  readonly content: MessageContent
  readonly timestamp: Date
  readonly type: 'bot' | 'human'
  readonly metadata?: Record<string, unknown>
}

export type MessageContent = string | React.ReactNode

export interface ActionDefinition {
  readonly type: 'input' | 'select'
  readonly id: ActionId
  readonly placeholder?: string
  readonly options?: SelectOption[]
}

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export interface ActionResult {
  readonly value: string
  readonly option?: SelectOption
}

export interface BotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: ActionId
}

export interface BotUIEvents {
  'message.add': Message
  'action.show': ActionDefinition
  'action.resolve': ActionResult
  'typing.set': boolean
  'error.occurred': BotUIError
}

// EventEmitter interface
export interface EventEmitter {
  on<K extends keyof BotUIEvents>(event: K, listener: (data: BotUIEvents[K]) => void): void
  off<K extends keyof BotUIEvents>(event: K, listener: (data: BotUIEvents[K]) => void): void
  emit<K extends keyof BotUIEvents>(event: K, data: BotUIEvents[K]): void
}
```

**Run Tests**:
```bash
cd packages/botui
npm test -- types.test.ts
```

#### 1.2 Update Package Exports

**Test First**:
```typescript
// packages/botui/tests/exports.test.ts
describe('Package Exports', () => {
  it('should export all required types and interfaces', () => {
    const exports = require('../src/index.ts')

    expect(exports.Bot).toBeDefined()
    expect(exports.Message).toBeDefined()
    expect(exports.ActionDefinition).toBeDefined()
    expect(exports.BotUIError).toBeDefined()
  })
})
```

**Implementation**:
```typescript
// packages/botui/src/index.ts
// ... existing exports ...
export * from './types'
```

### Step 2: Event Emitter Integration

#### 2.1 Create Event Emitter Implementation

**Test First**:
```typescript
// packages/botui/tests/event-emitter.test.ts
import { createEventEmitter } from '../src/event-emitter'
import { BotUIEvents } from '../src/types'

describe('Event Emitter', () => {
  let emitter: ReturnType<typeof createEventEmitter>

  beforeEach(() => {
    emitter = createEventEmitter()
  })

  it('should emit and listen to events', () => {
    const listener = jest.fn()
    emitter.on('message.add', listener)

    const message = {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot' as const,
    }

    emitter.emit('message.add', message)
    expect(listener).toHaveBeenCalledWith(message)
  })

  it('should remove event listeners', () => {
    const listener = jest.fn()
    emitter.on('message.add', listener)
    emitter.off('message.add', listener)

    emitter.emit('message.add', {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot',
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('should handle multiple listeners', () => {
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    emitter.on('message.add', listener1)
    emitter.on('message.add', listener2)

    emitter.removeAllListeners()

    emitter.emit('message.add', {
      id: 'msg-1',
      content: 'Test message',
      timestamp: new Date(),
      type: 'bot' as const,
    })

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
  })
})
```

**Implementation**:
```typescript
// packages/botui/src/event-emitter.ts
import { BotUIEvents, EventEmitter } from './types'

type Listener<T> = (data: T) => void
type EventMap = { [K in keyof BotUIEvents]: Listener<BotUIEvents[K]>[] }

export function createEventEmitter(): EventEmitter {
  const listeners: Partial<EventMap> = {}

  return {
    on<K extends keyof BotUIEvents>(event: K, listener: Listener<BotUIEvents[K]>) {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event]!.push(listener)
    },

    off<K extends keyof BotUIEvents>(event: K, listener: Listener<BotUIEvents[K]>) {
      const eventListeners = listeners[event]
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    },

    emit<K extends keyof BotUIEvents>(event: K, data: BotUIEvents[K]) {
      const eventListeners = listeners[event]
      if (eventListeners) {
        eventListeners.forEach(listener => listener(data))
      }
    },
  }
}
```

**Run Tests**:
```bash
cd packages/botui
npm test -- event-emitter.test.ts
```

#### 2.2 Update Existing Bot Implementation

**Test First**:
```typescript
// packages/botui/tests/bot-integration.test.ts
import { createBot } from '../src/botui'

describe('Bot Event Integration', () => {
  it('should emit message.add when adding messages', async () => {
    const bot = createBot({ id: 'test-bot' })
    const listener = jest.fn()

    bot.on('message.add', listener)

    await bot.message('Hello world')

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Hello world',
        type: 'bot'
      })
    )
  })

  it('should emit action.show when showing actions', async () => {
    const bot = createBot({ id: 'test-bot' })
    const listener = jest.fn()

    bot.on('action.show', listener)

    const actionPromise = bot.action({
      type: 'input',
      id: 'test-action',
      placeholder: 'Enter text'
    })

    expect(listener).toHaveBeenCalledWith({
      type: 'input',
      id: 'test-action',
      placeholder: 'Enter text'
    })
  })
})
```

**Implementation**:
Update existing bot implementation to integrate with event emitter.

**Run Tests**:
```bash
cd packages/botui
npm test -- bot-integration.test.ts
```

### Step 3: React Package Setup

#### 3.1 Update React Package Dependencies

**Location**: `packages/@botui-react/`

**Update package.json**:
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

#### 3.2 Setup Testing Infrastructure

**Create test setup**:
```typescript
// packages/@botui-react/tests/setup.ts
import '@testing-library/jest-dom'

// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
```

**Update jest config**:
```json
// packages/@botui-react/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

### Step 4: useBotUI Hook Implementation

#### 4.1 Create useBotUI Hook

**Test First**:
```typescript
// packages/@botui-react/tests/useBotUI.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useBotUI } from '../src/hooks/useBotUI'
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

    act(() => {
      bot.emit('message.add', {
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

    act(() => {
      bot.emit('action.show', {
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
    act(() => {
      bot.emit('action.show', {
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

    act(() => {
      bot.emit('error.occurred', {
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

    // Set error
    act(() => {
      bot.emit('error.occurred', {
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
```

**Create Mock Bot**:
```typescript
// packages/@botui-react/tests/mocks/bot.ts
import { Bot } from '@botui/core/types'

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
```

**Implementation**:
```typescript
// packages/@botui-react/src/hooks/useBotUI.ts
import { useState, useEffect, useCallback } from 'react'
import { Bot, Message, ActionDefinition, ActionResult, BotUIError } from '@botui/core/types'

export interface UseBotUIState {
  messages: Message[]
  action: ActionDefinition | null
  isTyping: boolean
  error: BotUIError | null
}

export interface UseBotUIActions {
  resolve: (result: ActionResult) => void
  clearError: () => void
}

export type UseBotUIReturn = UseBotUIState & UseBotUIActions

export function useBotUI(bot: Bot): UseBotUIReturn {
  const [state, setState] = useState<UseBotUIState>({
    messages: [],
    action: null,
    isTyping: false,
    error: null,
  })

  const resolve = useCallback((result: ActionResult) => {
    bot.emit('action.resolve', result)
    setState(prev => ({ ...prev, action: null }))
  }, [bot])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    const handleMessageAdd = (message: Message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
    }

    const handleActionShow = (action: ActionDefinition) => {
      setState(prev => ({ ...prev, action }))
    }

    const handleTypingSet = (isTyping: boolean) => {
      setState(prev => ({ ...prev, isTyping }))
    }

    const handleError = (error: BotUIError) => {
      setState(prev => ({ ...prev, error }))
    }

    bot.on('message.add', handleMessageAdd)
    bot.on('action.show', handleActionShow)
    bot.on('typing.set', handleTypingSet)
    bot.on('error.occurred', handleError)

    return () => {
      bot.off('message.add', handleMessageAdd)
      bot.off('action.show', handleActionShow)
      bot.off('typing.set', handleTypingSet)
      bot.off('error.occurred', handleError)
    }
  }, [bot])

  return {
    ...state,
    resolve,
    clearError,
  }
}
```

**Run Tests**:
```bash
cd packages/@botui-react
npm test -- useBotUI.test.tsx
```

### Step 5: Context Provider Implementation

#### 5.1 Create BotUI Context

**Test First**:
```typescript
// packages/@botui-react/tests/BotUIContext.test.tsx
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

    render(
      <BotUIProvider bot={bot} messages={controlledMessages}>
        <TestComponent />
      </BotUIProvider>
    )

    expect(screen.getByTestId('messages-count')).toHaveTextContent('1')
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/context/BotUIContext.tsx
import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { Bot, Message, ActionDefinition, BotUIError } from '@botui/core/types'
import { useBotUI, UseBotUIReturn } from '../hooks/useBotUI'

interface BotUIContextValue extends UseBotUIReturn {
  bot: Bot
}

interface BotUIProviderProps {
  bot: Bot
  children: ReactNode
  // Controlled mode props (optional)
  messages?: Message[]
  action?: ActionDefinition | null
  isTyping?: boolean
  error?: BotUIError | null
  onMessagesChange?: (messages: Message[]) => void
  onActionChange?: (action: ActionDefinition | null) => void
  onTypingChange?: (isTyping: boolean) => void
  onErrorChange?: (error: BotUIError | null) => void
}

const BotUIContext = createContext<BotUIContextValue | null>(null)

export function BotUIProvider({
  bot,
  children,
  messages: controlledMessages,
  action: controlledAction,
  isTyping: controlledIsTyping,
  error: controlledError,
  onMessagesChange,
  onActionChange,
  onTypingChange,
  onErrorChange,
}: BotUIProviderProps) {
  const hookReturn = useBotUI(bot)

  // If on...Change handlers are provided, this effect will sync the
  // internal state with the parent component.
  // Consumers should memoize the handlers to prevent re-render loops.
  useEffect(() => {
    if (onMessagesChange) onMessagesChange(hookReturn.messages)
  }, [hookReturn.messages, onMessagesChange])

  useEffect(() => {
    if (onActionChange) onActionChange(hookReturn.action)
  }, [hookReturn.action, onActionChange])

  useEffect(() => {
    if (onTypingChange) onTypingChange(hookReturn.isTyping)
  }, [hookReturn.isTyping, onTypingChange])

  useEffect(() => {
    if (onErrorChange) onErrorChange(hookReturn.error)
  }, [hookReturn.error, onErrorChange])

  // Use controlled values if provided, otherwise use hook values
  const contextValue: BotUIContextValue = {
    bot,
    messages: controlledMessages ?? hookReturn.messages,
    action: controlledAction ?? hookReturn.action,
    isTyping: controlledIsTyping ?? hookReturn.isTyping,
    error: controlledError ?? hookReturn.error,
    resolve: hookReturn.resolve,
    clearError: hookReturn.clearError,
  }

  return (
    <BotUIContext.Provider value={contextValue}>
      {children}
    </BotUIContext.Provider>
  )
}

export function useBotUIContext(): BotUIContextValue {
  const context = useContext(BotUIContext)
  if (!context) {
    throw new Error('useBotUIContext must be used within a BotUIProvider')
  }
  return context
}
```

**Run Tests**:
```bash
cd packages/@botui-react
npm test -- BotUIContext.test.tsx
```

### Step 6: Component Implementation

#### 6.1 BotUI.Root Component

**Test First**:
```typescript
// packages/@botui-react/tests/components/BotUIRoot.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../src/components'
import { createMockBot } from './mocks/bot'

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

    render(
      <BotUI.Root bot={bot} onError={onError}>
        <ThrowError />
      </BotUI.Root>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    )
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
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/components/BotUIRoot.tsx
import React, { ErrorInfo, ReactNode } from 'react'
import { Bot } from '@botui/core/types'
import { BotUIProvider } from '../context/BotUIContext'
import { ErrorBoundary } from './ErrorBoundary'

interface BotUIRootProps {
  bot: Bot
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
  [key: string]: unknown // Allow additional props
}

export function BotUIRoot({
  bot,
  children,
  onError,
  className,
  ...props
}: BotUIRootProps) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat conversation"
      className={className}
      {...props}
    >
      <ErrorBoundary onError={onError}>
        <BotUIProvider bot={bot}>
          {children}
        </BotUIProvider>
      </ErrorBoundary>
    </div>
  )
}
```

#### 6.2 BotUI.Messages Component

**Test First**:
```typescript
// packages/@botui-react/tests/components/BotUIMessages.test.tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { BotUI } from '../src/components'
import { createMockBot } from './mocks/bot'

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

    act(() => {
      bot.emit('message.add', {
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
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/components/BotUIMessages.tsx
import React, { ReactNode } from 'react'
import { Message } from '@botui/core/types'
import { useBotUIContext } from '../context/BotUIContext'

interface BotUIMessagesRenderProps {
  messages: Message[]
}

interface BotUIMessagesProps {
  children: (props: BotUIMessagesRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIMessages({
  children,
  className,
  ...props
}: BotUIMessagesProps) {
  const { messages } = useBotUIContext()

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className={className}
      {...props}
    >
      {children({ messages })}
    </div>
  )
}
```

#### 6.3 BotUI.Message Component

**Test First**:
```typescript
// packages/@botui-react/tests/components/BotUIMessage.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../src/components'
import { Message } from '@botui/core/types'

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
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/components/BotUIMessage.tsx
import React, { ReactNode } from 'react'
import { Message, MessageContent } from '@botui/core/types'

interface BotUIMessageRenderProps {
  content: MessageContent
  isHuman: boolean
  message: Message
}

interface BotUIMessageProps {
  message: Message
  children: (props: BotUIMessageRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIMessage({
  message,
  children,
  className,
  ...props
}: BotUIMessageProps) {
  return (
    <div className={className} {...props}>
      {children({
        content: message.content,
        isHuman: message.type === 'human',
        message: message,
      })}
    </div>
  )
}
```

#### 6.4 BotUI.Actions Component

**Test First**:
```typescript
// packages/@botui-react/tests/components/BotUIActions.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUI } from '../src/components'
import { BotUIProvider } from '../src/context/BotUIContext'
import { createMockBot } from './mocks/bot'
import { ActionDefinition } from '@botui/core/types'

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

  it('should receive resolve function from render prop', () => {
    const bot = createMockBot()
    const action: ActionDefinition = { type: 'input', id: 'test-input' }
    const mockResolve = jest.fn()

    render(
      <BotUIProvider bot={bot} action={action}>
        <BotUI.Actions>
          {({ resolve }) => {
            resolve({ value: 'test' })
            return null
          }}
        </BotUI.Actions>
      </BotUIProvider>
    )
    // The context's resolve function is called
    // We can't directly test the passed function, but we can test the context's one.
    // In a real scenario, this would be tested by user interaction.
    expect(bot.emit).toHaveBeenCalledWith('action.resolve', { value: 'test' })
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/components/BotUIActions.tsx
import { ReactNode } from 'react'
import { ActionDefinition, ActionResult } from '@botui/core/types'
import { useBotUIContext } from '../context/BotUIContext'

interface BotUIActionsRenderProps {
  action: ActionDefinition | null
  resolve: (result: ActionResult) => void
}

interface BotUIActionsProps {
  children: (props: BotUIActionsRenderProps) => ReactNode
  className?: string
  [key: string]: unknown
}

export function BotUIActions({
  children,
  className,
  ...props
}: BotUIActionsProps) {
  const { action, resolve } = useBotUIContext()

  if (!action) {
    return null
  }

  return (
    <div className={className} {...props}>
      {children({ action, resolve })}
    </div>
  )
}
```

#### 6.5 ErrorBoundary Component
The `BotUIRoot` already wraps children in an `ErrorBoundary`. Here is the standalone implementation and test for completeness.

**Test First**:
```typescript
// packages/@botui-react/tests/components/ErrorBoundary.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

const ThrowError = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('should catch errors and call onError callback', () => {
    const onError = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
    consoleSpy.mockRestore()
  })

  it('should render fallback UI if provided', () => {
    const onError = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary onError={onError} fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error occurred')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    } else {
      console.error('Uncaught error:', error, errorInfo)
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
```

#### 6.6 Continue with remaining components...

**Continue implementing**:
- BotUI.Message
- BotUI.Actions
- BotUI.Action
- ErrorBoundary

**Run Tests After Each Component**:
```bash
cd packages/@botui-react
npm test -- --watch
```

### Step 7: SSR Support

#### 7.1 SSR-Safe Implementation

**Test First**:
```typescript
// packages/@botui-react/tests/ssr.test.tsx
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
})
```

### Step 8: Backward Compatibility Bridge

#### 8.1 Legacy Component Wrappers

**Test First**:
```typescript
// packages/@botui-react/tests/legacy.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BotUIMessageList, BotUIAction } from '../src/legacy'
import { createMockBot } from './mocks/bot'

describe('Legacy Components', () => {
  it('should render BotUIMessageList with deprecation warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    const bot = createMockBot()

    render(
      <BotUIMessageList bot={bot} />
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIMessageList is deprecated')
    )

    consoleSpy.mockRestore()
  })

  it('should render BotUIAction with deprecation warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    const bot = createMockBot()

    render(
      <BotUIAction bot={bot} />
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('BotUIAction is deprecated')
    )

    consoleSpy.mockRestore()
  })
})
```

**Implementation**:
```typescript
// packages/@botui-react/src/legacy/index.tsx
import React from 'react'
import { Bot } from '@botui/core/types'
import { BotUI } from '../components'

interface LegacyProps {
  bot: Bot
  className?: string
}

export function BotUIMessageList({ bot, className }: LegacyProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIMessageList is deprecated. Use <BotUI.Messages> instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages className={className}>
        {({ messages }) => (
          <div className="botui-messages-default">
            {messages.map(msg => (
              <div key={msg.id} className="botui-message-default">
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </BotUI.Messages>
    </BotUI.Root>
  )
}

export function BotUIAction({ bot, className }: LegacyProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIAction is deprecated. Use <BotUI.Actions> instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Actions className={className}>
        {({ action, resolve }) => {
          if (!action) return null

          if (action.type === 'input') {
            return (
              <input
                className="botui-action-input-default"
                placeholder={action.placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    resolve({ value: e.currentTarget.value })
                    e.currentTarget.value = ''
                  }
                }}
              />
            )
          }

          if (action.type === 'select') {
            return (
              <div className="botui-action-select-default">
                {action.options?.map(option => (
                  <button
                    key={option.value}
                    onClick={() => resolve({ value: option.value, option })}
                    disabled={option.disabled}
                    className="botui-action-button-default"
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
}
```

### Step 9: Integration Testing

#### 9.1 End-to-End Workflow Tests

**Test Implementation**:
```typescript
// packages/@botui-react/tests/integration.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BotUI } from '../src/components'
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
                  const input = e.target.elements.userInput
                  resolve({ value: input.value })
                  input.value = ''
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
    act(() => {
      bot.emit('message.add', {
        id: 'msg-1',
        content: 'Hello! What is your name?',
        timestamp: new Date(),
        type: 'bot'
      })
    })

    expect(screen.getByTestId('message-bot')).toHaveTextContent('Hello! What is your name?')

    // Bot shows input action
    act(() => {
      bot.emit('action.show', {
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

    render(
      <BotUI.Root bot={bot}>
        <BotUI.Messages>
          {({ messages, error, clearError }) => (
            <div>
              {error && (
                <div data-testid="error">
                  {error.message}
                  <button onClick={clearError} data-testid="clear-error">
                    Dismiss
                  </button>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id}>{msg.content}</div>
              ))}
            </div>
          )}
        </BotUI.Messages>
      </BotUI.Root>
    )

    // Emit error
    act(() => {
      bot.emit('error.occurred', {
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
})
```

### Step 10: Performance and Bundle Size Testing

#### 10.1 Bundle Size Tests

**Test Implementation**:
```typescript
// packages/@botui-react/tests/bundle-size.test.ts
import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

describe('Bundle Size', () => {
  it('should not exceed size limits', async () => {
    const bundlePath = path.resolve(__dirname, '../dist/index.js')
    const fs = require('fs')

    if (fs.existsSync(bundlePath)) {
      const stats = fs.statSync(bundlePath)
      const sizeKB = stats.size / 1024

      expect(sizeKB).toBeLessThan(50) // 50KB limit
    }
  })

  it('should have zero CSS dependencies', () => {
    const packageJson = require('../package.json')

    // Should not have CSS-related dependencies
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies
    }

    expect(deps.sass).toBeUndefined()
    expect(deps['node-sass']).toBeUndefined()
    expect(deps['scss']).toBeUndefined()
  })
})
```

### Step 11: Final Integration and Testing

#### 11.1 Run All Tests

**Command sequence**:
```bash
# Test botui core
cd packages/botui
npm test

# Test botui react
cd ../botui-react
npm test

# Test legacy compatibility
npm test -- legacy.test.tsx

# Test SSR
npm test -- ssr.test.tsx

# Test integration
npm test -- integration.test.tsx

# Build and test bundle
npm run build
npm test -- bundle-size.test.ts
```

#### 11.2 Update Package Exports

**Update package.json**:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./legacy": {
      "import": "./dist/legacy/index.js",
      "types": "./dist/legacy/index.d.ts"
    }
  },
  "sideEffects": false
}
```

## Testing Checklist

### Core Package (@botui/core)
- [ ] TypeScript contracts tests pass
- [ ] Event emitter tests pass
- [ ] Bot integration tests pass
- [ ] Existing functionality still works
- [ ] All exports are properly typed

### React Package (@botui/react)
- [ ] useBotUI hook tests pass
- [ ] Context provider tests pass
- [ ] All component tests pass
- [ ] Integration tests pass
- [ ] SSR tests pass
- [ ] Legacy compatibility tests pass
- [ ] Bundle size within limits
- [ ] Zero CSS dependencies

### Cross-Package Integration
- [ ] React package correctly uses core types
- [ ] Event flow works end-to-end
- [ ] Error handling works across packages
- [ ] Performance meets benchmarks

## Rollout Strategy

### Phase 1A: Internal Testing (Week 1-2)
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Internal dogfooding

### Phase 1B: Beta Release (Week 3-4)
- [ ] Beta npm release with `@beta` tag
- [ ] Community testing feedback
- [ ] Bug fixes and performance tuning
- [ ] Migration guide finalized

### Phase 1C: Stable Release (Week 5-6)
- [ ] Release as latest version
- [ ] Documentation site updated
- [ ] Migration tools available
- [ ] Community support ready

## Success Criteria

### Technical
- [ ] 100% test coverage for new code
- [ ] Zero breaking changes for existing API
- [ ] Bundle size < 50KB
- [ ] Performance equal or better than current
- [ ] SSR compatibility verified

### User Experience
- [ ] Migration path is clear and documented
- [ ] Deprecation warnings are helpful
- [ ] New API is intuitive and flexible
- [ ] Error messages are actionable

### Community
- [ ] Migration guide is comprehensive
- [ ] Examples demonstrate new capabilities
- [ ] Community feedback is positive
- [ ] Adoption rate meets targets

This implementation guide ensures a robust, test-driven approach to the headless migration while maintaining full backward compatibility and providing a clear path forward for existing users.