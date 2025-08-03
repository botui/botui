# BotUI React - Modern Headless Examples

## Overview

BotUI React provides a modern headless component library inspired by Headless UI. You get the behavior and logic, while maintaining complete control over styling and rendering.

## Core Patterns

### 1. Simple & Easy (Ready-to-Use Components)

Perfect for getting started quickly with sensible defaults.

```tsx
import { BotUI } from '@botui/react'
import { createBot } from 'botui'

function SimpleApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.MessageList />
      <BotUI.Action />
    </BotUI.Root>
  )
}
```

### 2. Headless & Flexible (Render Props)

Maximum control over rendering and styling.

```tsx
import { BotUI } from '@botui/react'

function HeadlessApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => (
          <div className="chat-messages">
            {messages.map(message => (
              <div
                key={message.key}
                className={`message ${(message.meta as any)?.fromHuman ? 'human' : 'bot'}`}
              >
                {(message.data as any)?.text}
              </div>
            ))}
          </div>
        )}
      </BotUI.Messages>

      <BotUI.Actions>
        {({ action, resolve }) => {
          if (!action) return null

          return (
            <div className="chat-input">
              <input
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    resolve({ value: e.currentTarget.value })
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          )
        }}
      </BotUI.Actions>
    </BotUI.Root>
  )
}
```

## Advanced Examples

### Custom Message Types

```tsx
function CustomMessageApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => (
          <div className="messages">
            {messages.map(message => (
              <BotUI.Message key={message.key} message={message}>
                {({ content, isHuman, message }) => {
                  const messageData = message.data as any

                  // Handle different message types
                  if (messageData?.type === 'image') {
                    return (
                      <div className={`message ${isHuman ? 'human' : 'bot'}`}>
                        <img src={messageData.src} alt={messageData.alt} />
                        {messageData.caption && <p>{messageData.caption}</p>}
                      </div>
                    )
                  }

                  if (messageData?.type === 'card') {
                    return (
                      <div className={`message card ${isHuman ? 'human' : 'bot'}`}>
                        <h3>{messageData.title}</h3>
                        <p>{messageData.description}</p>
                        {messageData.actions?.map((action: any) => (
                          <button key={action.id} onClick={action.handler}>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )
                  }

                  // Default text message
                  return (
                    <div className={`message ${isHuman ? 'human' : 'bot'}`}>
                      {content}
                    </div>
                  )
                }}
              </BotUI.Message>
            ))}
          </div>
        )}
      </BotUI.Messages>
    </BotUI.Root>
  )
}
```

### Advanced Action Handling

```tsx
function AdvancedActionsApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Actions>
        {({ action, resolve }) => {
          if (!action) return null

          const actionData = action.data as any

          // Handle different action types
          switch (actionData?.type) {
            case 'select':
              return (
                <div className="action-select">
                  <h4>{actionData.question}</h4>
                  <div className="options">
                    {actionData.options?.map((option: any) => (
                      <button
                        key={option.value}
                        className="option-button"
                        onClick={() => resolve({ selected: option })}
                        disabled={option.disabled}
                      >
                        {option.icon && <span className="icon">{option.icon}</span>}
                        {option.label}
                        {option.description && (
                          <small>{option.description}</small>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )

            case 'form':
              return (
                <form
                  className="action-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const data = Object.fromEntries(formData)
                    resolve({ formData: data })
                  }}
                >
                  {actionData.fields?.map((field: any) => (
                    <div key={field.name} className="form-field">
                      <label>{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  ))}
                  <button type="submit">Submit</button>
                </form>
              )

            case 'file':
              return (
                <div className="action-file">
                  <input
                    type="file"
                    accept={actionData.accept}
                    multiple={actionData.multiple}
                    onChange={(e) => {
                      const files = e.target.files
                      if (files?.length) {
                        resolve({ files: Array.from(files) })
                      }
                    }}
                  />
                </div>
              )

            default:
              // Default text input
              return (
                <div className="action-input">
                  <input
                    placeholder={actionData?.placeholder || "Type your message..."}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        resolve({ value: e.currentTarget.value })
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              )
          }
        }}
      </BotUI.Actions>
    </BotUI.Root>
  )
}
```

### Performance: Virtual Scrolling

For large message lists, use virtual scrolling:

```tsx
import { BotUI } from '@botui/react'

function VirtualizedApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Virtual height={400}>
        {({ index, style, message }) => (
          <div style={style} className="virtual-message">
            <div className={`message ${(message.meta as any)?.fromHuman ? 'human' : 'bot'}`}>
              {(message.data as any)?.text}
            </div>
          </div>
        )}
      </BotUI.Virtual>

      <BotUI.Action />
    </BotUI.Root>
  )
}
```

### Using with Styling Libraries

#### Tailwind CSS

```tsx
function TailwindApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => (
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.key}
                className={`max-w-xs rounded-lg p-3 ${
                  (message.meta as any)?.fromHuman
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {(message.data as any)?.text}
              </div>
            ))}
          </div>
        )}
      </BotUI.Messages>

      <BotUI.Actions>
        {({ action, resolve }) => (
          action && (
            <div className="p-4 border-t">
              <input
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    resolve({ value: e.currentTarget.value })
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          )
        )}
      </BotUI.Actions>
    </BotUI.Root>
  )
}
```

#### Styled Components

```tsx
import styled from 'styled-components'

const ChatContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
`

const Message = styled.div<{ $isHuman: boolean }>`
  max-width: 300px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  margin-left: ${props => props.$isHuman ? 'auto' : '0'};
  background: ${props => props.$isHuman ? '#3b82f6' : '#f3f4f6'};
  color: ${props => props.$isHuman ? 'white' : '#1f2937'};
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

function StyledApp() {
  const bot = createBot()

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages>
        {({ messages }) => (
          <ChatContainer>
            {messages.map(message => (
              <Message
                key={message.key}
                $isHuman={(message.meta as any)?.fromHuman}
              >
                {(message.data as any)?.text}
              </Message>
            ))}
          </ChatContainer>
        )}
      </BotUI.Messages>

      <BotUI.Actions>
        {({ action, resolve }) => (
          action && (
            <div style={{ padding: '1rem' }}>
              <Input
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    resolve({ value: e.currentTarget.value })
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          )
        )}
      </BotUI.Actions>
    </BotUI.Root>
  )
}
```

## Hook Patterns

### Basic Hook Usage

```tsx
import { useBotUI } from '@botui/react'

function HookExample() {
  const bot = createBot()
  const { messages, action, resolve, error, busy } = useBotUI(bot)

  return (
    <div>
      <div>Messages: {messages.length}</div>
      <div>Current Action: {action?.type || 'None'}</div>
      <div>Error: {error?.message || 'None'}</div>
      <div>Busy: {busy?.busy ? 'Yes' : 'No'}</div>

      {action && (
        <button onClick={() => resolve({ value: 'test' })}>
          Resolve Action
        </button>
      )}
    </div>
  )
}
```

### Custom Hook

```tsx
function useChatBot(botConfig: any) {
  const bot = createBot(botConfig)
  const { messages, action, resolve } = useBotUI(bot)

  const sendMessage = async (text: string) => {
    await bot.message.add({ text })
  }

  const askQuestion = async (question: string, options: any[]) => {
    await bot.message.add({ text: question })
    return bot.action.set({ type: 'select', options })
  }

  return {
    messages,
    action,
    resolve,
    sendMessage,
    askQuestion,
  }
}

function CustomHookApp() {
  const { messages, sendMessage, askQuestion } = useChatBot({ id: 'my-bot' })

  useEffect(() => {
    askQuestion('What is your favorite color?', [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' },
    ])
  }, [])

  return (
    <BotUI.Root bot={bot}>
      <BotUI.MessageList />
      <BotUI.Action />
    </BotUI.Root>
  )
}
```

## Best Practices

1. **Start Simple**: Begin with ready-made components, customize as needed
2. **TypeScript**: Use types for better development experience
3. **Performance**: Use `BotUI.Virtual` for large message lists
4. **Accessibility**: Add proper ARIA labels and keyboard navigation
5. **Error Handling**: Use error boundaries and handle errors gracefully
6. **Testing**: Test your custom renderers and action handlers

Choose the pattern that fits your needs - from simple ready-made components to fully custom headless implementations!