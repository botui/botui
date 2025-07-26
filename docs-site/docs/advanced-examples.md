# Advanced Examples

Real-world examples demonstrating sophisticated BotUI usage patterns for complex conversational interfaces.

## 1. Multi-Step Form Bot

A bot that collects user information through a conversational form with validation and conditional logic.

```jsx
import React, { useEffect } from 'react'
import { createBot } from 'botui'
import { BotUI, BotUIMessageList, BotUIAction, useBotUI, useBotUIAction } from '@botui/react'

const FormBot = () => {
  const myBot = createBot()

  // Validation plugin
  const validationPlugin = (block) => {
    if (block.type === 'action' && block.meta.validation) {
      // Add validation metadata for custom action renderers
      block.meta.hasValidation = true
    }
    return block
  }

  myBot.use(validationPlugin)

  const collectUserData = async () => {
    const userData = {}

    // Welcome message
    await myBot.message.add({
      text: 'Welcome! I\'ll help you create your profile. Let\'s start with some basic information.'
    })

    // Collect name with validation
    await myBot.message.add({ text: 'What\'s your full name?' })
    const nameResponse = await myBot.action.set(
      {
        placeholder: 'Enter your full name',
        pattern: '^[a-zA-Z\\s]{2,50}$'
      },
      {
        actionType: 'validatedInput',
        validation: {
          required: true,
          minLength: 2,
          errorMessage: 'Please enter a valid name (2-50 characters, letters only)'
        }
      }
    )
    userData.name = nameResponse.value

    // Collect email
    await myBot.message.add({ text: 'What\'s your email address?' })
    const emailResponse = await myBot.action.set(
      {
        placeholder: 'your.email@example.com',
        type: 'email'
      },
      {
        actionType: 'validatedInput',
        validation: {
          required: true,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          errorMessage: 'Please enter a valid email address'
        }
      }
    )
    userData.email = emailResponse.value

    // Collect age and show conditional content
    await myBot.message.add({ text: 'How old are you?' })
    const ageResponse = await myBot.action.set(
      {
        placeholder: 'Age',
        type: 'number',
        min: 13,
        max: 120
      },
      {
        actionType: 'validatedInput',
        validation: {
          required: true,
          min: 13,
          max: 120,
          errorMessage: 'Age must be between 13 and 120'
        }
      }
    )
    userData.age = parseInt(ageResponse.value)

    // Conditional content based on age
    if (userData.age < 18) {
      await myBot.message.add({
        text: 'Since you\'re under 18, we\'ll need parental consent.'
      })

      const consentResponse = await myBot.action.set(
        {
          options: [
            { label: 'I have parental consent', value: 'yes' },
            { label: 'I need to get permission', value: 'no' }
          ]
        },
        { actionType: 'select' }
      )
      userData.parentalConsent = consentResponse.selected.value

      if (userData.parentalConsent === 'no') {
        await myBot.message.add({
          text: 'Please get parental permission and come back to complete your registration.'
        })
        return
      }
    }

    // Collect interests
    await myBot.message.add({ text: 'What are your interests? (Select all that apply)' })
    const interestsResponse = await myBot.action.set(
      {
        isMultiSelect: true,
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Sports', value: 'sports' },
          { label: 'Music', value: 'music' },
          { label: 'Travel', value: 'travel' },
          { label: 'Gaming', value: 'gaming' },
          { label: 'Reading', value: 'reading' }
        ]
      },
      { actionType: 'select' }
    )
    userData.interests = interestsResponse.selected.map(item => item.value)

    // Show profile summary
    await myBot.message.add(
      {
        profile: userData
      },
      { messageType: 'profileSummary' }
    )

    // Confirmation
    const confirmResponse = await myBot.action.set(
      {
        options: [
          { label: 'Looks good!', value: 'confirm' },
          { label: 'Let me edit', value: 'edit' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    if (confirmResponse.selected.value === 'confirm') {
      await myBot.message.add({
        text: `Perfect! Welcome aboard, ${userData.name}! 🎉`
      })
      // Save data to backend
      console.log('Saving user data:', userData)
    } else {
      await myBot.message.add({
        text: 'No problem! Let\'s start over.'
      })
      // Restart the process
      setTimeout(() => collectUserData(), 1000)
    }
  }

  useEffect(() => {
    collectUserData()
  }, [])

  return (
    <BotUI bot={myBot}>
      <BotUIMessageList renderer={customRenderers} />
      <BotUIAction renderer={customRenderers} />
    </BotUI>
  )
}

// Custom renderers
const ValidatedInput = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState('')

  const validate = (inputValue) => {
    const validation = action.meta.validation
    if (!validation) return true

    if (validation.required && !inputValue.trim()) {
      setError(validation.errorMessage || 'This field is required')
      return false
    }

    if (validation.minLength && inputValue.length < validation.minLength) {
      setError(validation.errorMessage || `Minimum ${validation.minLength} characters required`)
      return false
    }

    if (validation.pattern && !new RegExp(validation.pattern).test(inputValue)) {
      setError(validation.errorMessage || 'Invalid format')
      return false
    }

    return true
  }

  const handleSubmit = () => {
    if (validate(value)) {
      bot.next({ value })
    }
  }

  return (
    <div className="validated-input">
      <input
        type={action.data.type || 'text'}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError('')
        }}
        placeholder={action.data.placeholder}
        min={action.data.min}
        max={action.data.max}
      />
      <button onClick={handleSubmit}>Continue</button>
      {error && <div className="error">{error}</div>}
    </div>
  )
}

const ProfileSummary = ({ message }) => {
  const { profile } = message.data
  return (
    <div className="profile-summary">
      <h3>Profile Summary</h3>
      <div><strong>Name:</strong> {profile.name}</div>
      <div><strong>Email:</strong> {profile.email}</div>
      <div><strong>Age:</strong> {profile.age}</div>
      <div><strong>Interests:</strong> {profile.interests.join(', ')}</div>
    </div>
  )
}

const customRenderers = {
  validatedInput: ValidatedInput,
  profileSummary: ProfileSummary
}
```

## 2. E-commerce Shopping Bot

A sophisticated shopping assistant that helps users browse products, add to cart, and checkout.

```jsx
const ShoppingBot = () => {
  const myBot = createBot()

  // Mock product data
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', image: '/headphones.jpg' },
    { id: 2, name: 'Running Shoes', price: 129.99, category: 'sports', image: '/shoes.jpg' },
    { id: 3, name: 'Coffee Mug', price: 19.99, category: 'home', image: '/mug.jpg' }
  ]

  let cart = []

  const startShopping = async () => {
    await myBot.message.add({
      text: 'Welcome to our store! 🛒 How can I help you today?'
    })

    const intentResponse = await myBot.action.set(
      {
        options: [
          { label: 'Browse products', value: 'browse' },
          { label: 'Search for something specific', value: 'search' },
          { label: 'View my cart', value: 'cart' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    switch (intentResponse.selected.value) {
      case 'browse':
        await browseProducts()
        break
      case 'search':
        await searchProducts()
        break
      case 'cart':
        await viewCart()
        break
    }
  }

  const browseProducts = async () => {
    await myBot.message.add({ text: 'Here are our featured products:' })

    // Show products
    await myBot.message.add(
      { products: products.slice(0, 3) },
      { messageType: 'productGrid' }
    )

    const productResponse = await myBot.action.set(
      {
        products: products.slice(0, 3),
        cart: cart
      },
      { actionType: 'productSelection' }
    )

    if (productResponse.action === 'addToCart') {
      const product = products.find(p => p.id === productResponse.productId)
      cart.push({ ...product, quantity: 1 })
      await myBot.message.add({
        text: `Added ${product.name} to your cart! 🎉`
      })
    }

    await continueShoppingPrompt()
  }

  const searchProducts = async () => {
    await myBot.message.add({ text: 'What are you looking for?' })

    const searchResponse = await myBot.action.set(
      { placeholder: 'Search products...' },
      { actionType: 'input' }
    )

    const searchTerm = searchResponse.value.toLowerCase()
    const results = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    )

    if (results.length > 0) {
      await myBot.message.add({
        text: `Found ${results.length} product(s) matching "${searchTerm}":`
      })
      await myBot.message.add(
        { products: results },
        { messageType: 'productGrid' }
      )
    } else {
      await myBot.message.add({
        text: `Sorry, no products found for "${searchTerm}". Try a different search term.`
      })
    }

    await continueShoppingPrompt()
  }

  const viewCart = async () => {
    if (cart.length === 0) {
      await myBot.message.add({ text: 'Your cart is empty. Let\'s find some products!' })
      await browseProducts()
      return
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    await myBot.message.add(
      { cartItems: cart, total },
      { messageType: 'cartSummary' }
    )

    const cartResponse = await myBot.action.set(
      {
        options: [
          { label: 'Proceed to Checkout', value: 'checkout' },
          { label: 'Continue Shopping', value: 'continue' },
          { label: 'Clear Cart', value: 'clear' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    switch (cartResponse.selected.value) {
      case 'checkout':
        await checkout()
        break
      case 'continue':
        await browseProducts()
        break
      case 'clear':
        cart = []
        await myBot.message.add({ text: 'Cart cleared!' })
        await startShopping()
        break
    }
  }

  const checkout = async () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    await myBot.message.add({
      text: `Great! Let's complete your order. Total: $${total.toFixed(2)}`
    })

    // Collect shipping info
    await myBot.message.add({ text: 'What\'s your shipping address?' })
    const addressResponse = await myBot.action.set(
      { placeholder: 'Enter your full address' },
      { actionType: 'input' }
    )

    // Payment method
    await myBot.message.add({ text: 'Choose your payment method:' })
    const paymentResponse = await myBot.action.set(
      {
        options: [
          { label: 'Credit Card', value: 'credit' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Apple Pay', value: 'apple' }
        ]
      },
      { actionType: 'select' }
    )

    // Order confirmation
    await myBot.message.add(
      {
        orderSummary: {
          items: cart,
          total,
          shipping: addressResponse.value,
          payment: paymentResponse.selected.label
        }
      },
      { messageType: 'orderConfirmation' }
    )

    const confirmResponse = await myBot.action.set(
      {
        options: [
          { label: 'Place Order', value: 'confirm' },
          { label: 'Go Back', value: 'back' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    if (confirmResponse.selected.value === 'confirm') {
      await myBot.message.add({
        text: '🎉 Order placed successfully! You\'ll receive a confirmation email shortly.'
      })
      cart = [] // Clear cart
    } else {
      await viewCart()
    }
  }

  const continueShoppingPrompt = async () => {
    const continueResponse = await myBot.action.set(
      {
        options: [
          { label: 'Browse more products', value: 'browse' },
          { label: 'Search again', value: 'search' },
          { label: 'View cart', value: 'cart' },
          { label: 'I\'m done', value: 'done' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    switch (continueResponse.selected.value) {
      case 'browse':
        await browseProducts()
        break
      case 'search':
        await searchProducts()
        break
      case 'cart':
        await viewCart()
        break
      case 'done':
        await myBot.message.add({ text: 'Thanks for shopping with us! Come back soon! 👋' })
        break
    }
  }

  useEffect(() => {
    startShopping()
  }, [])

  return (
    <BotUI bot={myBot}>
      <BotUIMessageList renderer={shoppingRenderers} />
      <BotUIAction renderer={shoppingRenderers} />
    </BotUI>
  )
}

// Shopping-specific renderers
const ProductGrid = ({ message }) => {
  const { products } = message.data
  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h4>{product.name}</h4>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}

const ProductSelection = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const { products } = action.data

  const handleAddToCart = (productId) => {
    bot.next({ action: 'addToCart', productId })
  }

  return (
    <div className="product-selection">
      {products.map(product => (
        <div key={product.id} className="product-action-card">
          <span>{product.name} - ${product.price}</span>
          <button onClick={() => handleAddToCart(product.id)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  )
}

const CartSummary = ({ message }) => {
  const { cartItems, total } = message.data
  return (
    <div className="cart-summary">
      <h3>Your Cart</h3>
      {cartItems.map((item, index) => (
        <div key={index} className="cart-item">
          <span>{item.name}</span>
          <span>Qty: {item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
    </div>
  )
}

const shoppingRenderers = {
  productGrid: ProductGrid,
  productSelection: ProductSelection,
  cartSummary: CartSummary
}
```

## 3. AI Assistant with Context Memory

An advanced AI assistant that maintains conversation context and provides intelligent responses.

```jsx
const AIAssistantBot = () => {
  const myBot = createBot()

  // Context management
  let conversationContext = {
    user: {},
    currentTopic: null,
    history: [],
    preferences: {}
  }

  // Context plugin
  const contextPlugin = (block) => {
    if (block.type === 'message') {
      // Store conversation history
      conversationContext.history.push({
        type: 'bot',
        content: block.data.text,
        timestamp: new Date().toISOString()
      })
    }
    return block
  }

  myBot.use(contextPlugin)

  const startConversation = async () => {
    await myBot.message.add({
      text: 'Hi! I\'m your AI assistant. I can help you with various tasks. What would you like to do today?'
    })

    await showMainMenu()
  }

  const showMainMenu = async () => {
    const menuResponse = await myBot.action.set(
      {
        options: [
          { label: '📝 Take notes', value: 'notes' },
          { label: '🧮 Calculate something', value: 'calculate' },
          { label: '📅 Schedule reminder', value: 'reminder' },
          { label: '🤖 Ask me anything', value: 'chat' },
          { label: '⚙️ Settings', value: 'settings' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    conversationContext.currentTopic = menuResponse.selected.value

    switch (menuResponse.selected.value) {
      case 'notes':
        await handleNotes()
        break
      case 'calculate':
        await handleCalculation()
        break
      case 'reminder':
        await handleReminder()
        break
      case 'chat':
        await handleChat()
        break
      case 'settings':
        await handleSettings()
        break
    }
  }

  const handleNotes = async () => {
    await myBot.message.add({ text: 'I\'ll help you take notes. What would you like to note down?' })

    const noteResponse = await myBot.action.set(
      { placeholder: 'Type your note here...' },
      { actionType: 'textarea' }
    )

    const note = {
      id: Date.now(),
      content: noteResponse.value,
      timestamp: new Date().toISOString(),
      tags: []
    }

    // Ask for tags
    await myBot.message.add({ text: 'Would you like to add tags to categorize this note?' })
    const tagResponse = await myBot.action.set(
      { placeholder: 'Enter tags separated by commas (optional)' },
      { actionType: 'input' }
    )

    if (tagResponse.value.trim()) {
      note.tags = tagResponse.value.split(',').map(tag => tag.trim())
    }

    // Save note (in real app, this would go to a database)
    conversationContext.notes = conversationContext.notes || []
    conversationContext.notes.push(note)

    await myBot.message.add(
      { note },
      { messageType: 'noteSaved' }
    )

    await continuationPrompt()
  }

  const handleCalculation = async () => {
    await myBot.message.add({
      text: 'I can help you with calculations. Enter a mathematical expression:'
    })

    const calcResponse = await myBot.action.set(
      {
        placeholder: 'e.g., 2 + 2 * 3, sqrt(16), 15% of 200',
        validation: true
      },
      { actionType: 'calculatorInput' }
    )

    try {
      // In a real app, use a proper math parser
      const result = evaluateExpression(calcResponse.value)

      await myBot.message.add(
        {
          expression: calcResponse.value,
          result: result
        },
        { messageType: 'calculationResult' }
      )
    } catch (error) {
      await myBot.message.add({
        text: 'Sorry, I couldn\'t calculate that. Please check your expression and try again.'
      })
    }

    await continuationPrompt()
  }

  const handleReminder = async () => {
    await myBot.message.add({ text: 'What would you like to be reminded about?' })

    const taskResponse = await myBot.action.set(
      { placeholder: 'Enter your reminder' },
      { actionType: 'input' }
    )

    await myBot.message.add({ text: 'When should I remind you?' })

    const timeResponse = await myBot.action.set(
      {
        options: [
          { label: 'In 1 hour', value: '1h' },
          { label: 'Tomorrow', value: '1d' },
          { label: 'Next week', value: '1w' },
          { label: 'Custom time', value: 'custom' }
        ]
      },
      { actionType: 'select' }
    )

    let reminderTime
    if (timeResponse.selected.value === 'custom') {
      await myBot.message.add({ text: 'Enter the date and time (e.g., "2024-12-25 14:30"):' })
      const customTimeResponse = await myBot.action.set(
        { placeholder: 'YYYY-MM-DD HH:MM', type: 'datetime-local' },
        { actionType: 'input' }
      )
      reminderTime = new Date(customTimeResponse.value)
    } else {
      const timeMap = { '1h': 1, '1d': 24, '1w': 168 }
      reminderTime = new Date(Date.now() + timeMap[timeResponse.selected.value] * 60 * 60 * 1000)
    }

    const reminder = {
      id: Date.now(),
      task: taskResponse.value,
      time: reminderTime,
      created: new Date().toISOString()
    }

    conversationContext.reminders = conversationContext.reminders || []
    conversationContext.reminders.push(reminder)

    await myBot.message.add(
      { reminder },
      { messageType: 'reminderSet' }
    )

    await continuationPrompt()
  }

  const continuationPrompt = async () => {
    const continueResponse = await myBot.action.set(
      {
        options: [
          { label: 'Main menu', value: 'menu' },
          { label: 'More ' + conversationContext.currentTopic, value: 'more' },
          { label: 'Exit', value: 'exit' }
        ]
      },
      { actionType: 'selectButtons' }
    )

    switch (continueResponse.selected.value) {
      case 'menu':
        await showMainMenu()
        break
      case 'more':
        // Repeat current topic
        await showMainMenu() // Could be more sophisticated
        break
      case 'exit':
        await myBot.message.add({ text: 'Goodbye! Feel free to ask for help anytime. 👋' })
        break
    }
  }

  useEffect(() => {
    startConversation()
  }, [])

  return (
    <BotUI bot={myBot}>
      <BotUIMessageList renderer={assistantRenderers} />
      <BotUIAction renderer={assistantRenderers} />
    </BotUI>
  )
}

// Helper function for calculations
const evaluateExpression = (expr) => {
  // This is a simplified evaluator - use a proper math library in production
  const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '')
  return Function('"use strict"; return (' + sanitized + ')')()
}

// Custom renderers for AI Assistant
const NoteSaved = ({ message }) => {
  const { note } = message.data
  return (
    <div className="note-saved">
      <h4>✅ Note Saved</h4>
      <div className="note-content">{note.content}</div>
      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
      <small>Saved at {new Date(note.timestamp).toLocaleString()}</small>
    </div>
  )
}

const CalculationResult = ({ message }) => {
  const { expression, result } = message.data
  return (
    <div className="calculation-result">
      <div className="expression">{expression}</div>
      <div className="equals">=</div>
      <div className="result">{result}</div>
    </div>
  )
}

const ReminderSet = ({ message }) => {
  const { reminder } = message.data
  return (
    <div className="reminder-set">
      <h4>⏰ Reminder Set</h4>
      <div><strong>Task:</strong> {reminder.task}</div>
      <div><strong>Time:</strong> {new Date(reminder.time).toLocaleString()}</div>
    </div>
  )
}

const assistantRenderers = {
  noteSaved: NoteSaved,
  calculationResult: CalculationResult,
  reminderSet: ReminderSet
}
```

These examples demonstrate:

1. **Multi-step forms** with validation and conditional logic
2. **E-commerce flows** with product browsing, cart management, and checkout
3. **AI assistants** with context memory and multiple capabilities
4. **Custom renderers** for specialized UI components
5. **Complex state management** across conversation flows
6. **Error handling** and validation patterns
7. **Real-world data structures** and API integration patterns

Each example shows how BotUI can be extended to create sophisticated conversational interfaces that go far beyond simple question-and-answer patterns.