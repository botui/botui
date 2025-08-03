import React, { ReactNode } from 'react'

// ===== BACKWARD COMPATIBILITY =====
// Preserve the existing MessageType enum and renderer system
export enum MessageType {
  text = 'text',
  embed = 'embed',
  image = 'image',
  links = 'links'
}

// Legacy renderer type for backward compatibility
export type Renderer = Record<string, (...args: any) => JSX.Element | null>

// Legacy message block type for backward compatibility
export type MessageBlock = {
  data: {
    src?: string
    text?: string
    [key: string]: any
  }
  meta: {
    fromHuman?: boolean
    messageType?: MessageType
    [key: string]: any
  }
  [key: string]: any
}

export type BotUIMessageTypes = {
  message: MessageBlock
}

// Legacy renderer components for backward compatibility
export function BotUIMessageText({ message }: BotUIMessageTypes) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIMessageText is deprecated. Use the new headless <BotUI.Message> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }
  return !message?.data?.text ? null : <>{message?.data?.text}</>
}

export function BotUIMessageImage({ message }: BotUIMessageTypes) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIMessageImage is deprecated. Use the new headless <BotUI.Message> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }
  return <img {...message.data} src={message?.data?.src} />
}

export function BotUIMessageEmbed({ message }: BotUIMessageTypes) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'BotUIMessageEmbed is deprecated. Use the new headless <BotUI.Message> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }
  return <iframe {...message.data} src={message?.data?.src}></iframe>
}

// Default message renderers for backward compatibility
export const messageRenderers: Renderer = {
  text: BotUIMessageText,
  image: BotUIMessageImage,
  embed: BotUIMessageEmbed,
}

// Legacy BotUIMessage component for backward compatibility
export const LegacyBotUIMessage = ({
  message,
  renderers = {},
}: BotUIMessageTypes & { renderers?: Renderer }) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Legacy BotUIMessage is deprecated. Use the new headless <BotUI.Message> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }

  const messageType = message?.meta?.messageType ?? 'text'
  const allRenderers = { ...messageRenderers, ...renderers }
  const MessageRenderer = allRenderers[messageType]

  const classes: string[] = ['botui_message_content', 'message_' + messageType]
  const fromHuman = message?.meta?.fromHuman || message?.meta?.previous?.type === 'action'
  if (fromHuman) {
    classes.push('human')
  }

  return (
    <div className="botui_message">
      <div className={classes.join(' ')}>
        {MessageRenderer ? (
          <MessageRenderer message={message} />
        ) : (
          message.meta.messageType
        )}
      </div>
    </div>
  )
}