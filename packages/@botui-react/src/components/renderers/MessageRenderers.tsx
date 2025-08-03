import React, { AnchorHTMLAttributes } from 'react'
import { IBlock, TBlockData } from 'botui'
import { MessageRenderer } from '../BotUIMessage.js'

// Types moved from BotUIMessageLinks.tsx
type Link = AnchorHTMLAttributes<{}> & {
  text: string
}

export type ActionLinksData = {
  links: Link[]
}

type LinksBlock = IBlock & {
  data: TBlockData & ActionLinksData
}

// Component moved from BotUIMessageLinks.tsx
export const BotUIMessageLinks = ({ message }: { message: LinksBlock }) => {
  return (
    <>
      {message?.data?.links.map((link: Link, i: number) => (
        <a {...link} key={i}>
          {link.text}
        </a>
      ))}
    </>
  )
}

/**
 * Built-in text message renderer
 */
export const BuiltInTextRenderer: MessageRenderer = ({ message }) => {
  return !message?.data?.text ? null : <>{message?.data?.text}</>
}

/**
 * Built-in image message renderer
 */
export const BuiltInImageRenderer: MessageRenderer = ({ message }) => {
  return <img {...message.data} src={message?.data?.src} />
}

/**
 * Built-in embed message renderer
 */
export const BuiltInEmbedRenderer: MessageRenderer = ({ message }) => {
  return <iframe {...message.data} src={message?.data?.src}></iframe>
}

/**
 * Built-in links message renderer
 */
export const BuiltInLinksRenderer: MessageRenderer = ({ message }) => {
  return <BotUIMessageLinks message={message as any} />
}

/**
 * Default built-in message renderers map
 */
export const builtInMessageRenderers = {
  text: BuiltInTextRenderer,
  image: BuiltInImageRenderer,
  embed: BuiltInEmbedRenderer,
  links: BuiltInLinksRenderer,
}
