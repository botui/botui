import React from 'react'
import { Block } from 'botui'
import { TransitionGroup } from 'react-transition-group'

import { CSSClasses } from '../types'
import { useBotUIMessage } from '../hooks'
import { SlideFade } from './Utils'

export type BotUIMessageTypes = {
  message: Block & {
    data: {
      text?: string
    }
  }
}

export const BotUIMessage = ({ message }: BotUIMessageTypes) => {
  const fromHuman = message?.meta?.previous?.type == 'action'
  const classes: string[] = [CSSClasses.botui_message_content]
  if (fromHuman) {
    classes.push('human')
  }

  return !message?.data?.text ? null : (
    <div className={CSSClasses.botui_message}>
      <SlideFade>
        <div>
          <div className={classes.join(' ')}>
            {message?.data?.text}
          </div>
        </div>
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
