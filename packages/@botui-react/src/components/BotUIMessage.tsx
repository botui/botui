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
  links = 'links'
}

type MessageBlock = IBlock & {
  data: TBlockData & {
    src?: string
    text?: string
  },
  meta: TBlockMeta & {
    fromHuman?: boolean
    messageType?: MessageType
  }
}

export type BotUIMessageTypes = {
  message: MessageBlock
}

export function BotUIMessageText({ message }: BotUIMessageTypes) {
  return !message?.data?.text ? null : <>{message?.data?.text}</>
}

export function BotUIMessageImage({ message }: BotUIMessageTypes) {
  return <img {...message.data} src={message?.data?.src} />
}

export function BotUIMessageEmbed({ message }: BotUIMessageTypes) {
  return <iframe {...message.data} src={message?.data?.src}></iframe>
}

export const BotUIMessage = ({
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

type BotUIMessageListTypes = {
  renderer?: Renderer
  bringIntoView?: boolean
  children?: (props: {
    messages: MessageBlock[]
    renderMessage: (message: MessageBlock, index: number) => React.ReactElement
  }) => React.ReactElement
}

const messageRenderers: Renderer = {
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
    ...messageRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  const renderMessage = (message: MessageBlock, index: number) => (
    <BotUIMessage
      key={index}
      message={message}
      renderers={renderers}
    />
  )

  // HeadlessUI-style render prop
  if (children) {
    return children({ messages: messages as MessageBlock[], renderMessage })
  }

  // Default rendering
  return (
    <TransitionGroup>
      {messages.map((message: IBlock, i: number) => (
        <BotUIMessage
          key={i}
          message={message}
          renderers={renderers}
        />
      ))}
    </TransitionGroup>
  )
}
