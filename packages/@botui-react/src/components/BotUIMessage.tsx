import React from 'react'
import { Block, BlockData, BlockMeta } from 'botui'
import { TransitionGroup } from 'react-transition-group'

import { CSSClasses, Renderer } from '../types.js'
import { useBotUIMessage } from '../hooks/index.js'
import { BringIntoView, SlideFade } from './Utils.js'

export enum MessageType {
  text = 'text',
  embed = 'embed',
  image = 'image'
}

type MessageBlock = Block & {
  data: BlockData & {
    src?: string
    text?: string
  },
  meta: BlockMeta & {
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

export const BotUIMessage = ({ message, renderers }: BotUIMessageTypes & { renderers: Renderer }) => {
  const messageType = message?.meta?.messageType ?? 'text'
  const MessageRenderer = renderers[messageType]

  const classes: string[] = [CSSClasses.botui_message_content, 'message_' + messageType]
  const fromHuman = message?.meta?.fromHuman || message?.meta?.previous?.type == 'action'
  if (fromHuman) {
    classes.push('human')
  }

  return (
    <div className={CSSClasses.botui_message}>
      <SlideFade>
        <BringIntoView>
          <div className={classes.join(' ')}>
            {
              MessageRenderer ? <MessageRenderer message={message} /> : message.meta.messageType
            }
          </div>
        </BringIntoView>
      </SlideFade>
    </div>
  )
}

const messageRenderers: Renderer = {
  text: BotUIMessageText,
  image: BotUIMessageImage,
  embed: BotUIMessageEmbed,
}

type BotUIMessageListTypes = {
  renderer?: Renderer
}

export const BotUIMessageList = ({ renderer }: BotUIMessageListTypes) => {
  const messages = useBotUIMessage()
  const renderers: Renderer = {
    ...messageRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  return (
    <div className={CSSClasses.botui_message_list}>
      <TransitionGroup>
        {messages.map((message: Block, i: number) => (
          <BotUIMessage key={i} message={message} renderers={renderers} />
        ))}
      </TransitionGroup>
    </div>
  )
}
