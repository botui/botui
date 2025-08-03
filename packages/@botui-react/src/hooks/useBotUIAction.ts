import { useContext } from 'react'
import { useBotUIContext } from '../context/BotUIContext.js'

/**
 * Returns the current action
 * @deprecated Use the new headless components instead
 */
export const useBotUIAction = (): any => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'useBotUIAction is deprecated. Use <BotUI.Actions> with render props instead. ' +
      'See migration guide: https://botui.dev/migration'
    )
  }

  const context = useBotUIContext()

  // Return action in legacy format if available
  if (context?.action) {
    return {
      data: {
        placeholder: (context.action.data as any)?.placeholder,
        options: (context.action.data as any)?.options,
        isMultiSelect: context.action.type === 'select'
      },
      meta: {
        actionType: context.action.type
      },
      key: (context.action.data as any)?.id ?? context.action.key
    }
  }

  return null
}
