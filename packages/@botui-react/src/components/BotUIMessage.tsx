import React from 'react'
import { IBlock, TBlockData, TBlockMeta } from 'botui'
import { TransitionGroup } from 'react-transition-group'

import { useBotUIMessage } from '../hooks/index.js'
import { builtInMessageRenderers } from './renderers/MessageRenderers.js'

// Types moved from core/MessageRenderer.tsx
export enum MessageType {
  text = 'text',
  embed = 'embed',
  image = 'image',
  links = 'links',
}

export type MessageBlock = IBlock & {
  data: TBlockData & {
    src?: string
    text?: string
  }
  meta: TBlockMeta & {
    fromHuman?: boolean
    messageType?: MessageType
  }
}

export type MessageRenderer = (props: {
  message: MessageBlock
}) => JSX.Element | null

export type MessageRendererMap = Record<string, MessageRenderer>



export type BotUIMessageTypes = {
  message: MessageBlock
}

export const BotUIMessage = React.memo(
  ({
    message,
    renderers,
  }: BotUIMessageTypes & {
    renderers: MessageRendererMap
    bringIntoView?: boolean
  }) => {
    // Inlined logic from CoreMessageRenderer
    const messageType = message?.meta?.messageType ?? 'text'
    const MessageRendererComponent = renderers[messageType]

    if (MessageRendererComponent) {
      return <MessageRendererComponent message={message} />
    }

    // Default fallback - just show the message type
    return <>{messageType}</>
  }
)

type BotUIMessageListTypes = {
  renderer?: MessageRendererMap
  bringIntoView?: boolean
  children?: (props: { messages: MessageBlock[] }) => React.ReactElement
}

// Export default renderers for users who want to use them
export const defaultMessageRenderers: MessageRendererMap =
  builtInMessageRenderers

export const BotUIMessageList = ({
  renderer = {},
  children,
}: BotUIMessageListTypes) => {
  const messages = useBotUIMessage()
  const renderers: MessageRendererMap = {
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
          message={message as MessageBlock}
          renderers={renderers}
        />
      ))}
    </TransitionGroup>
  )
}
