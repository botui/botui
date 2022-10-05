import React from 'react'
import { Block, BlockData, BlockMeta } from 'botui'
import { TransitionGroup } from 'react-transition-group'

import { CSSClasses } from '../types'
import { useBotUIMessage } from '../hooks'
import { BringIntoView, SlideFade } from './Utils'

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

const messageHanlders = {
  text: BotUIMessageText,
  image: BotUIMessageImage,
  embed: BotUIMessageEmbed,
}

export const BotUIMessage = ({ message }: BotUIMessageTypes) => {
  const fromHuman = message?.meta?.fromHuman || message?.meta?.previous?.type == 'action'
  const classes: string[] = [CSSClasses.botui_message_content]
  if (fromHuman) {
    classes.push('human')
  }

  const messageType = message?.meta?.messageType || 'text'
  const Message = messageHanlders[messageType]
  return (
    <div className={CSSClasses.botui_message}>
      <SlideFade>
        <BringIntoView>
          <div className={classes.join(' ')}>
            {
              Message ? <Message message={message} /> : message.meta.messageType
            }
          </div>
        </BringIntoView>
      </SlideFade>
    </div>
  )
}

export const BotUIMessageList = () => {
  const messages = useBotUIMessage()

  return <div className={CSSClasses.botui_message_list}>
    <TransitionGroup>
      {
        messages.map((msg: Block, i: number) => <BotUIMessage key={i} message={msg} />)
      }
    </TransitionGroup>
  </div>
}
