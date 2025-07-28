import React from 'react'
import { BotUI } from './index'
import { Bot } from '../hooks/useBotUI'
import {
  MessageType,
  Renderer,
  BotUIMessageTypes,
  LegacyBotUIMessage,
  messageRenderers
} from './BotUIMessage'

// Re-export legacy types and enums for backward compatibility
export { MessageType, type Renderer, type BotUIMessageTypes } from './BotUIMessage'

interface LegacyProps {
  bot: Bot
  className?: string
}

// Legacy BotUIMessageList component
export function BotUIMessageList({
  bot,
  className,
  renderer = {},
}: LegacyProps & { renderer?: Renderer }) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIMessageList is deprecated. Use <BotUI.Messages> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }

  const renderers: Renderer = {
    ...messageRenderers,
    ...renderer, // allow override of existing renderers
  }

  return (
    <BotUI.Root bot={bot}>
      <BotUI.Messages className={className}>
        {({ messages }) => (
          <div className="botui_message_list">
            {messages.map((message, i) => {
              // Convert new message format to legacy format for backward compatibility
              const legacyMessage = {
                data: {
                  text: typeof message.content === 'string' ? message.content : '',
                  ...message.metadata
                },
                meta: {
                  fromHuman: message.type === 'human',
                  messageType: MessageType.text,
                  ...message.metadata
                },
                id: message.id,
                timestamp: message.timestamp
              }

              return (
                <LegacyBotUIMessage
                  key={i}
                  message={legacyMessage}
                  renderers={renderers}
                />
              )
            })}
          </div>
        )}
      </BotUI.Messages>
    </BotUI.Root>
  )
}

// Legacy BotUIAction component
export function BotUIAction({ bot, className }: LegacyProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIAction is deprecated. Use <BotUI.Actions> with render props instead. ' +
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
              <div className="botui_action_container">
                <input
                  className="botui_action_input"
                  placeholder={action.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      resolve({ value: e.currentTarget.value })
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            )
          }

          if (action.type === 'select') {
            return (
              <div className="botui_action_container">
                <div className="botui_action_select">
                  {action.options?.map(option => (
                    <button
                      key={option.value}
                      onClick={() => resolve({ value: option.value, option })}
                      disabled={option.disabled}
                      className="botui_action_button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          }

          return null
        }}
      </BotUI.Actions>
    </BotUI.Root>
  )
}