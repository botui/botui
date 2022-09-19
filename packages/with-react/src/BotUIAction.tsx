import React, { KeyboardEvent, useState } from 'react'
import { Block, BlockData, BlockMeta, BOTUI_TYPES } from 'botui'
import { useBotUI, useBotUIAction } from './hooks'
import { BotuiActionSelect } from './BotUIActionSelect'

export type ActionTextData = {
  placeholder: string
  // any other attribute allowed on the input element can also be used
}

type ActionTextBlock = Block & {
  data: BlockData & ActionTextData
}

export const BotuiActionText = () => {
  const bot = useBotUI()
  const [value, setValue] = useState('')
  const action = useBotUIAction() as ActionTextBlock

  return (
    <div>
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
        className="botui-button-next"
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
    <div className="botui-actions-container">
      {action ? (
        action.type == BOTUI_TYPES.ACTION && Action && !action.meta?.waiting ? (
          <Action data={action.data} />
        ) : (
          <div>{action?.meta?.waiting ? 'wait' : action.type}</div>
        )
      ) : null}
    </div>
  )
}
