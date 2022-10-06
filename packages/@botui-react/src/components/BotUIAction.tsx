import React, { useEffect, useRef } from 'react'
import { Block, BlockMeta, BOTUI_TYPES } from 'botui'

import { CSSClasses, Renderer } from '../types'
import { BringIntoView, SlideFade } from './Utils'
import { useBotUI, useBotUIAction } from '../hooks'
import { BotuiActionSelect } from './BotUIActionSelect'

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

const actionRenderers = {
  input: BotuiActionText,
  select: BotuiActionSelect,
}

export type ActionBlock = Block & {
  meta: BlockMeta & {
    actionType: string
  }
}

type BotUIActionTypes = {
  renderer: Renderer
}

export function BotUIAction({ renderer }: BotUIActionTypes) {
  const action = useBotUIAction() as ActionBlock
  const renderers: Renderer = {
    ...actionRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  const Action = renderers[action?.meta?.actionType]

  return (
    <div className={CSSClasses.botui_action_container}>
      {action ? (
        action.type == BOTUI_TYPES.ACTION &&
        Action !== undefined &&
        !action.meta?.waiting ? (
          <Action />
        ) : (
          <div>
            {action?.meta?.waiting ? (
              <BotUIWait />
            ) : (
              `Action rendered not found: ${action?.meta?.actionType}`
            )}
          </div>
        )
      ) : null}
    </div>
  )
}
