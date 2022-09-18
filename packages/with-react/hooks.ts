import { Block, BotuiInterface, BOTUI_TYPES } from 'botui'
import { useContext, createContext, useState, useEffect } from 'react'

export const BotUIContext = createContext<BotuiInterface>({} as BotuiInterface)

/**
 * Get the current botui object from the React context.
 */
export const useBotUI = (): BotuiInterface => {
  const context = useContext<BotuiInterface>(BotUIContext)

  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }

  return context
}

export const useBotUIAction = () => {
  const [action, setAction] = useState<Block | null>(null)
  const context = useContext(BotUIContext)

  useEffect(() => {
    context?.onChange(BOTUI_TYPES.ACTION, (action: Block) => {
      setAction({...action})
    })
  }, [context])

  return action
}

export const useBotUIMessage = () => {
  const [message, setMessage] = useState<Block[] | []>([])
  const context = useContext(BotUIContext)

  useEffect(() => {
    context?.onChange(BOTUI_TYPES.MESSAGE, (message: Block[]) => {
      setMessage([...message])
    })
  }, [context])

  return message
}