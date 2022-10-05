import React, { useEffect, useRef } from 'react'
import { Block, BlockData, BlockMeta, BOTUI_TYPES } from 'botui'

import { CSSClasses } from '../types'
import { BringIntoView, SlideFade } from './Utils'
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
  const ref = useRef<HTMLInputElement | null>(null)
  const action = useBotUIAction() as ActionTextBlock

  useEffect(() => {
    ref?.current?.focus?.()
  }, [])

  return (
    <SlideFade>
      <BringIntoView>
        <form
          className={CSSClasses.botui_action}
          onSubmit={(e) => {
            e.preventDefault()

            // not using a state and getting value to support unchanged-input-submission
            // and to avoid an extra onChange on input
            const value = ref?.current?.value
            bot.next({
              value: value,
              text: value, // to be added to the message
            })
          }}
        >
          <input
            ref={ref}
            type="text"
            {...action?.data} // spread the rest of data properties as attributes
          />
          <button className={CSSClasses.botui_button}>Done</button>
        </form>
      </BringIntoView>
    </SlideFade>
  )
}

const BOTUI_ACTIONS = {
  input: BotuiActionText,
  select: BotuiActionSelect,
}

export type ActionBlock = Block & {
  meta: BlockMeta & {
    actionType: string
  }
}

export function BotUIAction() {
  const action = useBotUIAction() as ActionBlock
  const Action = BOTUI_ACTIONS[action?.meta?.actionType]

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
