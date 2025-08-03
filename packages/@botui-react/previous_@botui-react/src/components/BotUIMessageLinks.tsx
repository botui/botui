import { Block, BlockData } from 'botui'
import React, { AnchorHTMLAttributes } from 'react'

type Link = AnchorHTMLAttributes<{}> & {
  text: string
}

export type ActionLinksData = {
  links: Link[]
}

type LinksBlock = Block & {
  data: BlockData & ActionLinksData
}

export const BotUIMessageLinks = ({ message }: { message: LinksBlock }) => {
  return <>
    {message?.data?.links.map((link: Link, i: number) => (<a {...link} key={i}>{link.text}</a>))}
  </>
}