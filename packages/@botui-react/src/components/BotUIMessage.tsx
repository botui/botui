import React from 'react'
import { IBlock, TBlockData, TBlockMeta } from 'botui'
import { TransitionGroup } from 'react-transition-group'

import { useBotUIMessage } from '../hooks/index.js'
import { BotUIMessageLinks } from './BotUIMessageLinks.js'

type Renderer = Record<string, (...args: any) => JSX.Element | null>

export enum MessageType {
  text = 'text',
  embed = 'embed',
  image = 'image',
  links = 'links',
}

type MessageBlock = IBlock & {
  data: TBlockData & {
    src?: string
    text?: string
  }
  meta: TBlockMeta & {
    fromHuman?: boolean
    messageType?: MessageType
  }
}

export type BotUIMessageTypes = {
  message: MessageBlock
}

export const BotUIMessageText = React.memo(({ message }: BotUIMessageTypes) => {
  return !message?.data?.text ? null : <>{message?.data?.text}</>
})

export const BotUIMessageImage = React.memo(
  ({ message }: BotUIMessageTypes) => {
    return <img {...message.data} src={message?.data?.src} />
  }
)

export const BotUIMessageEmbed = React.memo(
  ({ message }: BotUIMessageTypes) => {
    return <iframe {...message.data} src={message?.data?.src}></iframe>
  }
)

export const BotUIMessage = React.memo(
  ({
    message,
    renderers,
  }: BotUIMessageTypes & { renderers: Renderer; bringIntoView?: boolean }) => {
    const messageType = message?.meta?.messageType ?? 'text'
    const MessageRenderer = renderers[messageType]

    return (
      <>
        {MessageRenderer ? (
          <MessageRenderer message={message} />
        ) : (
          message.meta.messageType
        )}
      </>
    )
  }
)

type BotUIMessageListTypes = {
  renderer?: Renderer
  bringIntoView?: boolean
  children?: (props: { messages: MessageBlock[] }) => React.ReactElement
}

// Export default renderers for users who want to use them
export const defaultMessageRenderers: Renderer = {
  text: BotUIMessageText,
  image: BotUIMessageImage,
  embed: BotUIMessageEmbed,
  links: BotUIMessageLinks,
}

export const BotUIMessageList = ({
  renderer = {},
  children,
}: BotUIMessageListTypes) => {
  const messages = useBotUIMessage()
  const renderers: Renderer = {
    ...defaultMessageRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  // Simplified headless approach - just give users the raw messages
  if (children) {
    return children({ messages: messages as MessageBlock[] })
  }

  // Default rendering for backward compatibility
  return (
    <TransitionGroup>
      {messages.map((message: IBlock) => (
        <BotUIMessage
          key={message.key}
          message={message}
          renderers={renderers}
        />
      ))}
    </TransitionGroup>
  )
}
