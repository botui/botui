import { useContext, createContext } from 'react'

// const useBotUIAction = () => {
//   const [action, setAction] = useState({})

//   useEffect(() => {
//     botui.onChange(BOTUI_TYPES.ACTION, (action) => {
//       setAction({...action})
//     })
//   }, [])

//   return action
// }

export const BotUIContext = createContext<{} | null>(null)

/**
 * Get the current botui object from the React context.
 */

export const useBotUI = () => {
  const context = useContext(BotUIContext)

  if (!context) {
    throw new Error(
      `The \`useBotUI\` hook must be used inside the <BotUI> component's context.`
    )
  }

  const { bot } = context
  return bot
}