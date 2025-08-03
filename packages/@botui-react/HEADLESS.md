# HeadlessUI Pattern for @botui-react

**Clean render props, just like HeadlessUI!** ✨

## 🎯 The Pattern

```jsx
<BotUI bot={bot}>
  {({ bot, messages, action }) => (
    <div className="my-chat">
      <BotUIMessageList>
        {({ messages, renderMessage }) => (
          <div className="messages">
            {messages.map((message, i) => (
              <div key={i} className={message.meta?.fromHuman ? 'human' : 'bot'}>
                {renderMessage(message, i)}
              </div>
            ))}
          </div>
        )}
      </BotUIMessageList>

      <BotUIAction>
        {({ action, actionType, isWaiting, handleSubmit }) => (
          <div className="action">
            {isWaiting ? (
              <div>Bot is thinking...</div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault()
                const input = e.target.querySelector('input')
                handleSubmit({ text: input.value, value: input.value })
              }}>
                <input type="text" placeholder="Type here..." />
                <button type="submit">Send</button>
              </form>
            )}
          </div>
        )}
      </BotUIAction>
    </div>
  )}
</BotUI>
```

## 🚀 Examples

### Simple Custom Layout
```jsx
<BotUIMessageList>
  {({ messages, renderMessage }) => (
    <div className="chat-messages">
      <h3>Chat ({messages.length})</h3>
      {messages.map((message, i) => (
        <div key={i} className={`message ${message.meta?.fromHuman ? 'human' : 'bot'}`}>
          <span className="avatar">{message.meta?.fromHuman ? '👤' : '🤖'}</span>
          {renderMessage(message, i)}
        </div>
      ))}
    </div>
  )}
</BotUIMessageList>
```

### Custom Action Form
```jsx
<BotUIAction>
  {({ action, actionType, handleSubmit }) => (
    <div className="custom-action">
      <div className="action-type">{actionType}</div>
      {actionType === 'input' && (
        <form onSubmit={(e) => {
          e.preventDefault()
          const input = e.target.querySelector('input')
          handleSubmit({ text: input.value, value: input.value })
          input.value = ''
        }}>
          <input type="text" placeholder="Your message..." />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  )}
</BotUIAction>
```

### Framework Integration

**Tailwind CSS:**
```jsx
<BotUIMessageList>
  {({ messages, renderMessage }) => (
    <div className="space-y-4 p-6">
      {messages.map((message, i) => (
        <div key={i} className={`flex ${message.meta?.fromHuman ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs px-4 py-2 rounded-lg ${
            message.meta?.fromHuman
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}>
            {renderMessage(message, i)}
          </div>
        </div>
      ))}
    </div>
  )}
</BotUIMessageList>
```

**Material-UI:**
```jsx
<BotUIAction>
  {({ action, handleSubmit }) => (
    <Paper elevation={1} sx={{ p: 2 }}>
      <form onSubmit={(e) => {
        e.preventDefault()
        const input = e.target.querySelector('input')
        handleSubmit({ text: input.value, value: input.value })
      }}>
        <TextField fullWidth placeholder="Type here..." />
        <Button type="submit" variant="contained">Send</Button>
      </form>
    </Paper>
  )}
</BotUIAction>
```

## 🔧 API

### BotUI
Exposes bot state via render prop:
```jsx
<BotUI bot={bot}>
  {({ bot, messages, action }) => (
    // Your custom UI
  )}
</BotUI>
```

### BotUIMessageList
Exposes messages and rendering function:
```jsx
<BotUIMessageList>
  {({ messages, renderMessage }) => (
    // Your custom message layout
  )}
</BotUIMessageList>
```

### BotUIAction
Exposes action state and submission:
```jsx
<BotUIAction>
  {({ action, actionType, isWaiting, handleSubmit }) => (
    // Your custom action UI
  )}
</BotUIAction>
```

## ✅ Zero Breaking Changes

Your existing code still works:
```jsx
// This continues to work exactly as before
<BotUI bot={bot}>
  <BotUIMessageList renderer={messageRenderers} />
  <BotUIAction renderer={actionRenderers} />
</BotUI>
```

## 🎨 Design Philosophy

- **Minimal**: Just add render props to existing components
- **Familiar**: Uses the exact HeadlessUI pattern you know
- **Flexible**: Complete control over styling and layout
- **Progressive**: Start simple, add complexity when needed

**Now you have HeadlessUI's power with @botui-react's simplicity!** 🚀