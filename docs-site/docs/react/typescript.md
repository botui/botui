# React + TypeScript

Complete guide to using BotUI with React and TypeScript for type-safe conversational interfaces.

## Installation

```bash
npm install botui @botui/react
npm install --save-dev typescript @types/react @types/react-dom
```

## Basic Setup

```typescript
import { createBot, BotuiInterface } from 'botui'
import { BotUI, BotUIMessageList, BotUIAction } from '@botui/react'

const myBot: BotuiInterface = createBot()
```

## Typed Hooks

All BotUI React hooks provide full TypeScript support:

```typescript
import React from 'react'
import { useBotUI, useBotUIAction, useBotUIMessage } from '@botui/react'
import { BotuiInterface, Block } from 'botui'

const MyBotComponent: React.FC = () => {
  const bot: BotuiInterface = useBotUI()
  const action: Block | null = useBotUIAction()
  const messages: Block[] = useBotUIMessage()

  // Type-safe usage
  const handleClick = () => {
    bot.next({ userClicked: true })
  }

  return (
    <div>
      <p>Messages: {messages.length}</p>
      {action && <p>Current action: {action.meta.actionType}</p>}
      <button onClick={handleClick}>Continue</button>
    </div>
  )
}
```

## Custom Renderer Types

Define strongly-typed custom renderers for your React components:

```typescript
import React from 'react'
import { Renderer } from '@botui/react'
import { Block } from 'botui'

// Define custom renderer props
interface MessageProps {
  message: Block
}

interface ActionProps {
  // No props needed as hooks provide the data
}

// Custom message data interfaces
interface ChartMessageData {
  chartType: string
  data: number[]
}

interface RatingActionData {
  question: string
  maxRating: number
}

// Typed custom renderers
const ChartMessage: React.FC<MessageProps> = ({ message }) => {
  const chartData = message.data as ChartMessageData

  return (
    <div className="chart-message">
      <h4>Chart: {chartData.chartType}</h4>
      <div className="chart-data">
        {chartData.data.map((value, index) => (
          <div key={index} className="chart-bar" style={{ height: value * 10 }}>
            {value}
          </div>
        ))}
      </div>
    </div>
  )
}

const RatingAction: React.FC<ActionProps> = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const ratingData = action?.data as RatingActionData

  const handleRating = (rating: number) => {
    bot.next({ rating, timestamp: Date.now() })
  }

  return (
    <div className="rating-action">
      <p>{ratingData?.question}</p>
      <div className="rating-buttons">
        {Array.from({ length: ratingData?.maxRating || 5 }, (_, i) => (
          <button key={i} onClick={() => handleRating(i + 1)}>
            {i + 1} ⭐
          </button>
        ))}
      </div>
    </div>
  )
}

// Typed renderer object
const customRenderers: Renderer = {
  chart: ChartMessage,
  rating: RatingAction
}

// Usage in component
const App: React.FC = () => {
  return (
    <BotUI bot={myBot}>
      <BotUIMessageList renderer={customRenderers} />
      <BotUIAction renderer={customRenderers} />
    </BotUI>
  )
}
```

## Typed Conversation Flows

Create type-safe conversation flows with proper interfaces:

```typescript
import { BotuiInterface } from 'botui'

interface UserProfile {
  name: string
  email: string
  age: number
}

interface ValidationResponse {
  value: string
  isValid: boolean
}

const collectUserProfile = async (bot: BotuiInterface): Promise<UserProfile> => {
  // Get name with validation
  await bot.message.add({ text: "What's your name?" })
  const nameResponse = await bot.action.set(
    { placeholder: 'Enter your name' },
    {
      actionType: 'input',
      validation: { required: true, minLength: 2 }
    }
  ) as ValidationResponse

  // Get email with validation
  await bot.message.add({ text: "What's your email?" })
  const emailResponse = await bot.action.set(
    { placeholder: 'Enter your email', type: 'email' },
    {
      actionType: 'input',
      validation: { required: true, pattern: 'email' }
    }
  ) as ValidationResponse

  // Get age with validation
  await bot.message.add({ text: "What's your age?" })
  const ageResponse = await bot.action.set(
    { placeholder: 'Enter your age', type: 'number' },
    {
      actionType: 'input',
      validation: { required: true, min: 13, max: 120 }
    }
  ) as ValidationResponse

  return {
    name: nameResponse.value,
    email: emailResponse.value,
    age: parseInt(ageResponse.value, 10)
  }
}

// Usage with proper error handling
const handleUserRegistration = async () => {
  try {
    const profile = await collectUserProfile(myBot)
    console.log(`Hello ${profile.name}!`) // Type-safe access

    // Continue with registration
    await myBot.message.add({
      text: `Thanks ${profile.name}! We'll send updates to ${profile.email}`
    })
  } catch (error) {
    await myBot.message.add({
      text: 'Sorry, something went wrong. Please try again.'
    })
  }
}
```

## Advanced Component Patterns

### Typed Component with State

```typescript
import React, { useState, useEffect } from 'react'
import { useBotUI, useBotUIAction } from '@botui/react'

interface FormState {
  isValid: boolean
  errors: string[]
  values: Record<string, string>
}

const TypedFormAction: React.FC = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const [formState, setFormState] = useState<FormState>({
    isValid: false,
    errors: [],
    values: {}
  })

  const validateForm = (values: Record<string, string>): FormState => {
    const errors: string[] = []

    if (!values.name?.trim()) {
      errors.push('Name is required')
    }

    if (!values.email?.includes('@')) {
      errors.push('Valid email is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
      values
    }
  }

  const handleSubmit = () => {
    if (formState.isValid) {
      bot.next({
        formData: formState.values,
        submittedAt: new Date().toISOString()
      })
    }
  }

  return (
    <div className="typed-form">
      <div className="form-fields">
        <input
          placeholder="Name"
          onChange={(e) => {
            const newValues = { ...formState.values, name: e.target.value }
            setFormState(validateForm(newValues))
          }}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => {
            const newValues = { ...formState.values, email: e.target.value }
            setFormState(validateForm(newValues))
          }}
        />
      </div>

      {formState.errors.length > 0 && (
        <div className="errors">
          {formState.errors.map((error, index) => (
            <div key={index} className="error">{error}</div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!formState.isValid}
      >
        Submit
      </button>
    </div>
  )
}
```

### Generic Renderer Factory

```typescript
interface RendererProps<T = any> {
  message: Block & { data: T }
}

// Generic renderer factory
function createTypedRenderer<T>(
  Component: React.FC<RendererProps<T>>
): React.FC<{ message: Block }> {
  return ({ message }) => (
    <Component message={message as Block & { data: T }} />
  )
}

// Usage
interface ProductData {
  id: string
  name: string
  price: number
  image: string
}

const ProductRenderer = createTypedRenderer<ProductData>(({ message }) => (
  <div className="product-card">
    <img src={message.data.image} alt={message.data.name} />
    <h3>{message.data.name}</h3>
    <p>${message.data.price}</p>
  </div>
))

const renderers: Renderer = {
  product: ProductRenderer
}
```

## Testing with TypeScript

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { createBot } from 'botui'
import { BotUI, BotUIAction } from '@botui/react'

describe('BotUI TypeScript Integration', () => {
  test('should handle typed actions correctly', async () => {
    const bot = createBot()

    // Set up typed action
    const actionPromise = bot.action.set(
      { placeholder: 'Enter name' },
      { actionType: 'input' }
    )

    render(
      <BotUI bot={bot}>
        <BotUIAction />
      </BotUI>
    )

    // Interact with the action
    const input = screen.getByPlaceholderText('Enter name')
    fireEvent.change(input, { target: { value: 'John' } })
    fireEvent.click(screen.getByText('Submit'))

    // Verify typed response
    const response = await actionPromise
    expect(response.value).toBe('John')
    expect(typeof response.value).toBe('string')
  })
})
```

## TypeScript Configuration

Recommended `tsconfig.json` for React + BotUI projects:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

## Best Practices

1. **Define clear interfaces** for your data structures
2. **Use type guards** for runtime type checking
3. **Leverage generic types** for reusable components
4. **Type your custom renderers** properly
5. **Handle errors gracefully** with proper typing
6. **Test your types** to ensure they work as expected

With TypeScript, your React BotUI applications become more maintainable, catch errors at compile time, and provide excellent developer experience with IntelliSense and autocomplete.