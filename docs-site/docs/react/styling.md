# Styling and Theming Guide

BotUI React components come with default styling, but you can fully customize the appearance to match your application's design.

## Default Theme

Import the default theme to get started:

```jsx
import '@botui/react/dist/styles/default.theme.scss'
```

This provides basic styling for all BotUI components with a clean, modern look.

## CSS Classes

BotUI components use consistent CSS class names that you can target for custom styling:

### Component Classes

```scss
// Main container
.botui_app_container {
  /* Your custom styles */
}

// Message list container
.botui_message_container {
  /* Message list styles */
}

// Individual message
.botui_message {
  /* Message wrapper styles */
}

// Message content
.botui_message_content {
  /* Message content styles */
}

// Action container
.botui_action_container {
  /* Action wrapper styles */
}

// Individual action
.botui_action {
  /* Action styles */
}

// Buttons
.botui_button {
  /* Button styles */
}

// Wait/loading indicator
.botui_wait {
  /* Loading styles */
}
```

### Type-Specific Classes

Messages and actions automatically get type-specific classes:

```scss
// Message types
.message_text { /* Text messages */ }
.message_image { /* Image messages */ }
.message_embed { /* Embed messages */ }
.message_links { /* Links messages */ }
.message_custom { /* Your custom message types */ }

// Action types
.action_input { /* Input actions */ }
.action_select { /* Select actions */ }
.action_selectButtons { /* Select button actions */ }
.action_custom { /* Your custom action types */ }

// Human messages (user responses)
.botui_message_content.human {
  /* Styles for user messages */
}
```

## Custom Styling Examples

### Dark Theme

```scss
.botui_app_container {
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

.botui_message_content {
  background-color: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 12px;
  padding: 12px 16px;
  margin: 8px 0;
  max-width: 70%;
}

.botui_message_content.human {
  background-color: #007bff;
  color: white;
  margin-left: auto;
  margin-right: 0;
}

.botui_action {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.botui_button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.botui_button:hover {
  background-color: #0056b3;
}
```

### Chat Bubble Style

```scss
.botui_message_content {
  position: relative;
  background-color: #f1f1f1;
  border-radius: 18px;
  padding: 10px 16px;
  margin: 6px 0;
  max-width: 75%;
  word-wrap: break-word;
}

// Bot message bubble (left-aligned)
.botui_message_content:not(.human) {
  background-color: #e9ecef;
  margin-right: auto;
}

.botui_message_content:not(.human)::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #e9ecef;
}

// Human message bubble (right-aligned)
.botui_message_content.human {
  background-color: #007bff;
  color: white;
  margin-left: auto;
  margin-right: 0;
}

.botui_message_content.human::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #007bff;
}
```

### Minimal Style

```scss
.botui_app_container {
  font-family: 'SF Pro Display', -apple-system, sans-serif;
  line-height: 1.6;
}

.botui_message_content {
  border: none;
  background: none;
  padding: 8px 0;
  margin: 4px 0;
  max-width: none;
}

.botui_message_content.human {
  font-weight: 600;
  color: #666;
}

.botui_action {
  border-top: 1px solid #eee;
  padding-top: 16px;
  margin-top: 16px;
}

.botui_button {
  background: none;
  border: 2px solid #007bff;
  color: #007bff;
  border-radius: 4px;
  padding: 6px 12px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.botui_button:hover {
  background-color: #007bff;
  color: white;
}
```

## CSS Variables

Use CSS variables for consistent theming across your application:

```scss
:root {
  // Colors
  --botui-primary-color: #007bff;
  --botui-secondary-color: #6c757d;
  --botui-success-color: #28a745;
  --botui-danger-color: #dc3545;
  --botui-warning-color: #ffc107;
  --botui-info-color: #17a2b8;

  // Background colors
  --botui-bg-primary: #ffffff;
  --botui-bg-secondary: #f8f9fa;
  --botui-bg-message-bot: #e9ecef;
  --botui-bg-message-human: #007bff;

  // Text colors
  --botui-text-primary: #212529;
  --botui-text-secondary: #6c757d;
  --botui-text-muted: #adb5bd;

  // Spacing
  --botui-spacing-xs: 4px;
  --botui-spacing-sm: 8px;
  --botui-spacing-md: 16px;
  --botui-spacing-lg: 24px;
  --botui-spacing-xl: 32px;

  // Typography
  --botui-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --botui-font-size-sm: 14px;
  --botui-font-size-md: 16px;
  --botui-font-size-lg: 18px;

  // Border radius
  --botui-border-radius: 8px;
  --botui-border-radius-sm: 4px;
  --botui-border-radius-lg: 12px;
}

// Use variables in your styles
.botui_message_content {
  background-color: var(--botui-bg-message-bot);
  color: var(--botui-text-primary);
  font-family: var(--botui-font-family);
  font-size: var(--botui-font-size-md);
  border-radius: var(--botui-border-radius);
  padding: var(--botui-spacing-md);
  margin: var(--botui-spacing-sm) 0;
}

.botui_message_content.human {
  background-color: var(--botui-bg-message-human);
  color: white;
}
```

## Responsive Design

Make your bot responsive across different screen sizes:

```scss
.botui_app_container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

// Mobile styles
@media (max-width: 768px) {
  .botui_message_content {
    max-width: 85%;
    font-size: 14px;
    padding: 10px 12px;
  }

  .botui_action {
    padding: 12px;
  }

  .botui_button {
    display: block;
    width: 100%;
    margin: 4px 0;
  }
}

// Tablet styles
@media (min-width: 769px) and (max-width: 1024px) {
  .botui_message_content {
    max-width: 75%;
  }
}

// Desktop styles
@media (min-width: 1025px) {
  .botui_message_content {
    max-width: 60%;
  }
}
```

## Animation Customization

BotUI uses `react-transition-group` for animations. You can customize these:

```scss
// Slide fade animation (default)
.slide-fade-enter {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.slide-fade-exit {
  opacity: 1;
  transform: translateY(0);
}

.slide-fade-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}

// Custom bounce animation
.bounce-enter {
  opacity: 0;
  transform: scale(0.3);
}

.bounce-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 300ms ease-out, transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Custom Message Types Styling

Style your custom message types:

```scss
// Chart message
.message_chart {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .chart-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 12px;
    margin-top: 8px;
  }
}

// Notification message
.message_notification {
  border-left: 4px solid #ffc107;
  background-color: #fff3cd;
  color: #856404;

  &.priority-high {
    border-left-color: #dc3545;
    background-color: #f8d7da;
    color: #721c24;
  }
}

// Product card message
.message_product {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;

  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .product-info {
    padding: 16px;

    .product-title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .product-price {
      color: #28a745;
      font-size: 18px;
      font-weight: bold;
    }
  }
}
```

## Advanced Styling with Styled Components

If you prefer CSS-in-JS, you can use styled-components:

```jsx
import styled from 'styled-components'
import { BotUI, BotUIMessageList, BotUIAction } from '@botui/react'

const StyledBotUI = styled(BotUI)`
  .botui_app_container {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 400px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .botui_message_content {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 12px 16px;

    &.human {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }

  .botui_button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 8px;
    padding: 10px 20px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }
`

const MyApp = () => (
  <StyledBotUI bot={myBot}>
    <BotUIMessageList />
    <BotUIAction />
  </StyledBotUI>
)
```

## Theme Switching

Implement dynamic theme switching:

```jsx
import { useState } from 'react'

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  return (
    <div className={`botui-theme-${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      {children}
    </div>
  )
}
```

```scss
// Light theme
.botui-theme-light {
  --botui-bg-primary: #ffffff;
  --botui-bg-message-bot: #f8f9fa;
  --botui-text-primary: #212529;
}

// Dark theme
.botui-theme-dark {
  --botui-bg-primary: #1a1a1a;
  --botui-bg-message-bot: #2d2d2d;
  --botui-text-primary: #ffffff;
}
```

With these styling techniques, you can create a BotUI that perfectly matches your application's design system and provides an excellent user experience across all devices.