import React, { useEffect, useRef } from 'react'
import { IBlock, TBlockMeta } from 'botui'

import { defaultTexts } from '../const.js'
import { useBotUI, useBotUIAction } from '../hooks/index.js'
import {
  BotuiActionSelect,
  BotuiActionSelectButtons,
} from './BotUIActionSelect.js'
import { BotUIButton, BotUICancelButton } from './Buttons.js'

type Renderer = Record<string, (...args: any) => JSX.Element | null>

export const BotUIWait = () => {
  return <>Waiting...</>
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
  cancelMessageText?: string
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

        const value = textAreaRef?.current?.value ?? inputRef?.current?.value
        bot.next({
          text: value,
          value: inputRef?.current?.files ?? value,
        })
      }}
    >
      {action?.data?.type === 'textarea' ? (
        <textarea ref={textAreaRef} {...action?.data}></textarea>
      ) : (
        <input type="text" ref={inputRef} {...action?.data} />
      )}
      <BotUIButton
        text={meta?.confirmButtonText ?? defaultTexts.buttons.confirm}
      />

      {meta?.cancelable ? (
        <BotUICancelButton
          {...meta}
          onClick={(cancelValue) => {
            bot.next({
              value: null,
              ...cancelValue,
            })
          }}
        />
      ) : null}
    </form>
  )
}

const actionRenderers: Renderer = {
  wait: BotUIWait,
  input: BotuiActionText,
  select: BotuiActionSelect,
  selectButtons: BotuiActionSelectButtons,
}

export type ActionBlock = IBlock & {
  meta: TBlockMeta & ActionMeta
}

type BotUIActionTypes = {
  renderer?: Renderer
  bringIntoView?: boolean
  children?: (props: {
    action: ActionBlock | null
    actionType: string
    isWaiting: boolean
    handleSubmit: (value: any) => void
  }) => React.ReactElement
}

export function BotUIAction({ renderer = {}, children }: BotUIActionTypes) {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionBlock
  const actionType = action?.meta?.actionType ?? 'input'
  const isWaiting = action?.meta?.waiting || false

  const renderers: Renderer = {
    ...actionRenderers,
    ...renderer,
  }

  const handleSubmit = (value: any) => {
    bot.next(value)
  }

  // HeadlessUI-style render prop
  if (children) {
    return children({
      action,
      actionType,
      isWaiting: Boolean(isWaiting),
      handleSubmit,
    })
  }

  // Default rendering
  const WaitRenderer = renderers['wait']
  const ActionRenderer = renderers[actionType]

  return (
    <>
      {action ? (
        action?.meta?.waiting ? (
          <WaitRenderer />
        ) : ActionRenderer !== undefined ? (
          <ActionRenderer />
        ) : (
          `Action renderer not found: ${
            action?.meta?.actionType
          }. ${JSON.stringify(action.meta)}`
        )
      ) : null}
    </>
  )
}
