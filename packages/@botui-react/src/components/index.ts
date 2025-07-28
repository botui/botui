import { BotUIRoot } from './BotUIRoot'
import { BotUIMessages } from './BotUIMessages'
import { BotUIMessage } from './BotUIMessage'
import { BotUIActions } from './BotUIActions'

// Export individual components for direct import
export { BotUIRoot } from './BotUIRoot'
export { BotUIMessages } from './BotUIMessages'
export { BotUIMessage } from './BotUIMessage'
export { BotUIActions } from './BotUIActions'
export { ErrorBoundary } from './ErrorBoundary'

// Export backward compatibility components and types
export {
  MessageType,
  BotUIMessageText,
  BotUIMessageImage,
  BotUIMessageEmbed,
  LegacyBotUIMessage,
  messageRenderers,
  type Renderer,
  type BotUIMessageTypes,
  type MessageBlock
} from './BotUIMessage'

export {
  BotUIMessageList,
  BotUIAction
} from './legacy'

// Export as BotUI namespace for dot notation usage
export const BotUI = {
  Root: BotUIRoot,
  Messages: BotUIMessages,
  Message: BotUIMessage,
  Actions: BotUIActions,
}