import React, { useEffect, useRef } from 'react'
import { Block, BlockMeta, BOTUI_BLOCK_TYPES } from 'botui'

import { CSSClasses, Renderer } from '../types.js'
import { useBotUI, useBotUIAction } from '../hooks/index.js'
import { BringIntoView, SlideFade, WithRefContext } from './Utils.js'
import {
  BotuiActionSelect,
  BotuiActionSelectButtons,
} from './BotUIActionSelect.js'

export const BotUIWait = () => {
  return (
    <div className={CSSClasses.botui_wait}>
      <i className="loading_dot"></i>
      <i className="loading_dot"></i>
      <i className="loading_dot"></i>
    </div>
  )
}

export type BotUIActionTextReturns = {
  text: string
  canceled?: boolean
  value: string | FileList
}

export type ActionMeta = {
  actionType: string
  cancelable?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
}

export const BotuiActionText = () => {
  const bot = useBotUI()
  const action = useBotUIAction()
  const meta = action?.meta as ActionMeta
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    inputRef?.current?.focus?.()
    textAreaRef?.current?.focus?.()
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        // not using a state and getting value to support unchanged-input-submission
        // and to avoid an extra onChange on input
        const value = textAreaRef?.current?.value ?? inputRef?.current?.value
        bot.next({
          text: value, // to be added to the message
          value: inputRef?.current?.files ?? value, // when type = 'file'
        })
      }}
    >
      {action?.data?.type === 'textarea' ? (
        <textarea
          ref={textAreaRef}
          {...action?.data} // spread the rest of data properties as attributes
        ></textarea>
      ) : (
        <input type="text" ref={inputRef} {...action?.data} />
      )}
      <button className={CSSClasses.botui_button}>
        {meta?.confirmButtonText ?? 'Done'}
      </button>
      {meta?.cancelable ? (
        <button
          onClick={(e) => {
            e.preventDefault()
            bot.next({
              text: null,
              value: null,
              canceled: true,
            })
          }}
          className={`${CSSClasses.botui_button} cancel`}
        >
          {meta?.cancelButtonText ?? 'Cancel'}
        </button>
      ) : null}
    </form>
  )
}

const actionRenderers = {
  wait: BotUIWait,
  input: BotuiActionText,
  select: BotuiActionSelect,
  selectButtons: BotuiActionSelectButtons,
}

export type ActionBlock = Block & {
  meta: BlockMeta & ActionMeta
}

type BotUIActionTypes = {
  renderer?: Renderer
  bringIntoView?: boolean
}

export function BotUIAction({
  renderer = {},
  bringIntoView = true,
}: BotUIActionTypes) {
  const action = useBotUIAction() as ActionBlock
  const actionType = action?.meta?.actionType ?? 'input'
  const renderers: Renderer = {
    ...actionRenderers,
    ...renderer, // use it after defaults to allow override of existing renderers
  }

  const WaitRenderer = renderers['wait']
  const ActionRenderer = renderers[actionType]
  const classes: string[] = [CSSClasses.botui_action, 'action_' + actionType]

  return (
    <div className={CSSClasses.botui_action_container}>
      {action?.type == BOTUI_BLOCK_TYPES.ACTION ? (
        action?.meta?.waiting ? (
          <WaitRenderer />
        ) : ActionRenderer !== undefined ? (
          <WithRefContext className={classes.join(' ')}>
            <SlideFade>
              <BringIntoView bringIntoView={bringIntoView}>
                <ActionRenderer />
              </BringIntoView>
            </SlideFade>
          </WithRefContext>
        ) : (
          `Action renderer not found: ${
            action?.meta?.actionType
          }. ${JSON.stringify(action.meta)}`
        )
      ) : null}
    </div>
  )
}
