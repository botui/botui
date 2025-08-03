import React, { ReactNode } from 'react'
import type { IBlock } from '../../../botui/src/types.js'
import { Renderer } from '../types.js'

// Message type enum for different message types
export enum MessageType {
  text = 'text',
  embed = 'embed',
  image = 'image',
  links = 'links',
  html = 'html',
  markdown = 'markdown'
}

export interface MessageComponentProps {
  message: IBlock
  className?: string
  [key: string]: any
}

export function BotUIMessageText({ message, className = '', ...props }: MessageComponentProps) {
  const text = (message.data as any)?.text || (message.data as any)?.content

  if (!text) {
    return null
  }

  return (
    <div className={`botui_message_text ${className}`} {...props}>
      {String(text)}
    </div>
  )
}

export function BotUIMessageImage({ message, className = '', ...props }: MessageComponentProps) {
  const data = (message.data as any) || {}
  const { src, alt, ...imageProps } = data

  if (!src) {
    return null
  }

  return (
    <div className={`botui_message_image ${className}`} {...props}>
      <img
        src={String(src)}
        alt={String(alt || 'Message image')}
        loading="lazy"
        {...imageProps}
      />
    </div>
  )
}

export function BotUIMessageEmbed({ message, className = '', ...props }: MessageComponentProps) {
  const data = (message.data as any) || {}
  const { src, title, ...embedProps } = data

  if (!src) {
    return null
  }

  return (
    <div className={`botui_message_embed ${className}`} {...props}>
      <iframe
        src={String(src)}
        title={String(title || 'Embedded content')}
        loading="lazy"
        {...embedProps}
      />
    </div>
  )
}

export function BotUIMessageLinks({ message, className = '', ...props }: MessageComponentProps) {
  const links = (message.data as any)?.links || []

  if (!Array.isArray(links) || links.length === 0) {
    return null
  }

  return (
    <div className={`botui_message_links ${className}`} {...props}>
      {links.map((link: any, index: number) => (
        <a
          key={index}
          href={link.url || link.href}
          target={link.target || '_blank'}
          rel={link.rel || 'noopener noreferrer'}
          className="botui_link"
        >
          {link.text || link.label || link.url}
        </a>
      ))}
    </div>
  )
}

export function BotUIMessageHTML({ message, className = '', ...props }: MessageComponentProps) {
  const html = (message.data as any)?.html || (message.data as any)?.content

  if (!html) {
    return null
  }

  return (
    <div
      className={`botui_message_html ${className}`}
      dangerouslySetInnerHTML={{ __html: String(html) }}
      {...props}
    />
  )
}

export function BotUIMessageMarkdown({ message, className = '', ...props }: MessageComponentProps) {
  // This is a basic implementation - users can replace with their preferred markdown renderer
  const markdown = (message.data as any)?.markdown || (message.data as any)?.content

  if (!markdown) {
    return null
  }

  // Basic markdown parsing (replace with proper markdown library in real usage)
  const processedContent = String(markdown)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className={`botui_message_markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      {...props}
    />
  )
}

// Default message renderers
export const defaultMessageRenderers: Renderer = {
  text: BotUIMessageText,
  image: BotUIMessageImage,
  embed: BotUIMessageEmbed,
  links: BotUIMessageLinks,
  html: BotUIMessageHTML,
  markdown: BotUIMessageMarkdown,
}

export interface BotUIMessageProps {
  message: IBlock
  renderers?: Renderer
  className?: string
  children?: ReactNode | ((props: { message: IBlock; content: ReactNode; isHuman: boolean }) => ReactNode)
  [key: string]: any
}

export function BotUIMessage({
  message,
  renderers = {},
  className = '',
  children,
  ...props
}: BotUIMessageProps) {
  // Combine default renderers with custom ones
  const allRenderers = { ...defaultMessageRenderers, ...renderers }

    // Determine message type
  const messageType = (message.data as any)?.type || (message.meta as any)?.messageType || 'text'

  // Get the appropriate renderer
  const MessageRenderer = allRenderers[messageType as string]

  // Determine if message is from human
  const isHuman = Boolean(message.meta?.fromHuman)

  // Build CSS classes
  const classes = [
    'botui_message',
    `message_${messageType}`,
    isHuman ? 'human' : 'bot',
    className
  ].filter(Boolean).join(' ')

  // Render content
  const content = MessageRenderer ? (
    <MessageRenderer message={message} />
  ) : (
    <div className="botui_message_unknown">
      <div>Unknown message type: {messageType}</div>
    </div>
  )

  // Custom children override default rendering
  if (children) {
    return (
      <div className={classes} {...props}>
        {typeof children === 'function'
          ? children({ message, content, isHuman })
          : children
        }
      </div>
    )
  }

  return (
    <div className={classes} {...props}>
      <div className="botui_message_content">
        {content}
      </div>
    </div>
  )
}