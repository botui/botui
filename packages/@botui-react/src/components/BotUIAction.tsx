import React, { KeyboardEvent, useState } from 'react'
import { Block, BlockData, BlockMeta, BOTUI_TYPES } from 'botui'

import { SlideFade } from './Utils'
import { CSSClasses } from '../types'
import { useBotUI, useBotUIAction } from '../hooks'
import { BotuiActionSelect } from './BotUIActionSelect'

export type ActionTextData = {
  placeholder: string
  // any other attribute allowed on the input element can also be used
}

type ActionTextBlock = Block & {
  data: BlockData & ActionTextData
}

export const BotUIWait = () => {
  return <div className={CSSClasses.botui_wait}>
    <i className='loading_dot'></i>
    <i className='loading_dot'></i>
    <i className='loading_dot'></i>
  </div>
}

export const BotuiActionText = () => {
  const bot = useBotUI()
  const [value, setValue] = useState('')
  const action = useBotUIAction() as ActionTextBlock

  return (
    <SlideFade>
      <div>
        <div className={CSSClasses.botui_action}>
          <input
            type="text"
            {...action?.data} // spread the rest of data properties as attributes
            placeholder={action?.data?.placeholder}
            onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
              setValue((e.target as HTMLInputElement).value)
              if (e.key == 'Enter') {
                bot.next({
                  value: value,
                  text: value, // to be added to the message
                })
              }
            }}
          />
          <button
            className={CSSClasses.botui_button}
            onClick={() =>
              bot.next({
                value: value,
                text: value, // to be added to the message
              })
            }
          >
            Done
          </button>
        </div>
      </div>
    </SlideFade>
  )
}

const BOTUI_ACTIONS = {
  text: BotuiActionText,
  select: BotuiActionSelect,
}

export type ActionBlock = Block & {
  meta: BlockMeta & {
    input: string
  }
}

export function BotUIAction() {
  const action = useBotUIAction() as ActionBlock
  const Action = BOTUI_ACTIONS[action?.meta?.input]

  return (
    <div className={CSSClasses.botui_action_container}>
      {action ? (
        action.type == BOTUI_TYPES.ACTION && Action && !action.meta?.waiting ? (
          <Action data={action.data} />
        ) : (
          <div>{action?.meta?.waiting ? <BotUIWait /> : action.type}</div>
        )
      ) : null}
    </div>
  )
}
