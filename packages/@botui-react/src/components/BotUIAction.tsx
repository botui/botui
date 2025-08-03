import React, { ReactNode } from 'react'
import type { IBlock, EBlockTypes } from '../../../botui/src/types.js'
import { CSSClasses, Renderer } from '../types.js'
import { useBotUIContext } from '../context/BotUIContext.js'
import { BotUIActionInput } from './BotUIActionInput.js'
import { BotUIActionSelect, BotUIActionSelectButtons } from './BotUIActionSelect.js'
import { BotUIWait } from './BotUIWait.js'
import { BringIntoView, SlideFade, WithRefContext } from './BotUIUtils.js'

// Default action renderers
const defaultActionRenderers: Renderer = {
  wait: BotUIWait,
  input: BotUIActionInput,
  text: BotUIActionInput, // alias for input
  textarea: BotUIActionInput,
  file: BotUIActionInput,
  select: BotUIActionSelect,
  selectButtons: BotUIActionSelectButtons,
  buttons: BotUIActionSelectButtons, // alias for selectButtons
}

export interface BotUIActionProps {
  action?: IBlock | null
  renderers?: Renderer
  bringIntoView?: boolean
  className?: string
  children?: ReactNode | ((props: { action: IBlock; isWaiting: boolean; actionType: string }) => ReactNode)
  [key: string]: any
}

export function BotUIAction({
  action: propAction,
  renderers = {},
  bringIntoView = true,
  className = '',
  children,
  ...props
}: BotUIActionProps) {
  const { action: contextAction, busy } = useBotUIContext()
  const action = propAction ?? contextAction

  if (!action) {
    return null
  }

  // Combine default renderers with custom ones
  const allRenderers: Renderer = {
    ...defaultActionRenderers,
    ...renderers,
  }

    // Determine action type
  const actionType = (action.data as any)?.type || (action.meta as any)?.actionType || 'input'

  // Check if we're in a waiting state
  const isWaiting = (action.meta as any)?.waiting || (busy?.busy && busy.source === 'bot')

  // Get the appropriate renderer
  const ActionRenderer = isWaiting ? allRenderers['wait'] : allRenderers[actionType as string]

  // Build CSS classes
  const classes = [
    CSSClasses.botui_action,
    `action_${actionType}`,
    className
  ].filter(Boolean).join(' ')

  // Custom children override default rendering
  if (children) {
    return (
      <div className={CSSClasses.botui_action_container} {...props}>
        <WithRefContext className={classes}>
          <SlideFade>
            <BringIntoView bringIntoView={bringIntoView}>
              {typeof children === 'function'
                ? children({ action, isWaiting, actionType })
                : children
              }
            </BringIntoView>
          </SlideFade>
        </WithRefContext>
      </div>
    )
  }

  return (
    <div className={CSSClasses.botui_action_container} {...props}>
      {action.type === 'action' ? (
        ActionRenderer ? (
          <WithRefContext className={classes}>
            <SlideFade>
              <BringIntoView bringIntoView={bringIntoView}>
                <ActionRenderer action={action} />
              </BringIntoView>
            </SlideFade>
          </WithRefContext>
        ) : (
          <div className="botui_error">
            <div>Action renderer not found: {actionType}</div>
            {process.env.NODE_ENV !== 'production' && (
              <details>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify(action, null, 2)}</pre>
              </details>
            )}
          </div>
        )
      ) : null}
    </div>
  )
}