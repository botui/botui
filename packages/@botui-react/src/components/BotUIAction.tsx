import React, { useEffect, useRef } from 'react'
import { Block, BlockMeta, BOTUI_BLOCK_TYPES } from 'botui'

import { CSSClasses, Renderer } from '../types'
import { BringIntoView, SlideFade } from './Utils'
import { useBotUI, useBotUIAction } from '../hooks'
import { BotuiActionSelect, BotuiActionSelectButtons } from './BotUIActionSelect'

export const BotUIWait = () => {
  return <div className={CSSClasses.botui_wait}>
    <i className='loading_dot'></i>
    <i className='loading_dot'></i>
    <i className='loading_dot'></i>
  </div>
}

export const BotuiActionText = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const ref = useRef<HTMLInputElement | null>(null)

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
              value: ref?.current?.files ?? value, // when type = 'file'
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

const actionRenderers = {
  wait: BotUIWait,
  input: BotuiActionText,
  select: BotuiActionSelect,
  selectButtons: BotuiActionSelectButtons,
}

export type ActionBlock = Block & {
  meta: BlockMeta & {
    actionType: string
  }
}

type BotUIActionTypes = {
  renderer?: Renderer
}

export function BotUIAction({ renderer }: BotUIActionTypes) {
  const action = useBotUIAction() as ActionBlock
  const renderers: Renderer = {
    ...actionRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  const WaitRenderer = renderers['wait']
  const ActionRenderer = renderers[action?.meta?.actionType ?? 'input']

  return (
    <div className={CSSClasses.botui_action_container}>
      {action?.type == BOTUI_BLOCK_TYPES.ACTION ? (
        action?.meta?.waiting ? (
          <WaitRenderer />
        ) : ActionRenderer !== undefined ? (
          <ActionRenderer />
        ) : (
          `Action renderer not found: ${action?.meta?.actionType}. ${JSON.stringify(action.meta)}`
        )
      ) : null}
    </div>
  )
}
