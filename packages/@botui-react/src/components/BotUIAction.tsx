import React from 'react'
import { IBlock, TBlockMeta } from 'botui'

import { useBotUI, useBotUIAction } from '../hooks/index.js'
import { builtInActionRenderers } from './renderers/ActionRenderers.js'

// Types moved from core/ActionRenderer.tsx
export type ActionMeta = {
  actionType: string
  cancelable?: boolean
  cancelButtonText?: string
  cancelMessageText?: string
  confirmButtonText?: string
  waiting?: boolean
}

export type ActionBlock = IBlock & {
  meta: TBlockMeta & ActionMeta
}

export type ActionRenderer = (props: { action: ActionBlock }) => JSX.Element | null

export type ActionRendererMap = Record<string, ActionRenderer>



export type BotUIActionTextReturns = {
  text: string
  canceled?: boolean
  value: string | FileList
}

type BotUIActionTypes = {
  renderer?: ActionRendererMap
  bringIntoView?: boolean
  children?: (props: {
    action: ActionBlock | null
    actionType: string
    isWaiting: boolean
    handleSubmit: (value: any) => void
  }) => React.ReactElement
}

// Export default renderers for users who want to use them
export const defaultActionRenderers: ActionRendererMap = builtInActionRenderers

export function BotUIAction({ renderer = {}, children }: BotUIActionTypes) {
  const bot = useBotUI()
  const action = useBotUIAction() as ActionBlock
  const actionType = action?.meta?.actionType ?? 'input'
  const isWaiting = action?.meta?.waiting || false

  const renderers: ActionRendererMap = {
    ...defaultActionRenderers,
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

  // Default rendering (inlined from CoreActionRenderer)
  if (!action) {
    return null
  }

  // Handle waiting state
  if (isWaiting) {
    const WaitRenderer = renderers['wait']
    return WaitRenderer ? <WaitRenderer action={action} /> : <>Waiting...</>
  }

  // Handle normal action rendering
  const ActionRendererComponent = renderers[actionType]

  if (ActionRendererComponent) {
    return <ActionRendererComponent action={action} />
  }

  // Default fallback
  return (
    <>
      Action renderer not found: {actionType}. {JSON.stringify(action.meta)}
    </>
  )
}
