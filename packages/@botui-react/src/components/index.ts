import { BotUIRoot } from './BotUIRoot.js'
import { BotUIMessages } from './BotUIMessages.js'
import { BotUIMessage } from './BotUIMessage.js'
import { BotUIActions } from './BotUIActions.js'

// Export individual components for direct import
export { BotUIRoot } from './BotUIRoot.js'
export { BotUIMessages } from './BotUIMessages.js'
export { BotUIMessage } from './BotUIMessage.js'
export { BotUIActions } from './BotUIActions.js'
export { ErrorBoundary } from './ErrorBoundary.js'

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
} from './BotUIMessage.js'

export {
  BotUIMessageList,
  BotUIAction
} from './legacy.js'

// Export as BotUI namespace for dot notation usage
export const BotUI = {
  Root: BotUIRoot,
  Messages: BotUIMessages,
  Message: BotUIMessage,
  Actions: BotUIActions,
}