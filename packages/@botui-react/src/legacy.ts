// Legacy exports for backward compatibility
// These components are deprecated and will be removed in v2.0
// Please migrate to the new headless components in the main package

export {
  BotUIMessageList,
  BotUIAction
} from './components/legacy.js'

export {
  BotUIMessageText,
  BotUIMessageImage,
  BotUIMessageEmbed,
  LegacyBotUIMessage,
  messageRenderers,
  MessageType,
  type Renderer,
  type BotUIMessageTypes,
  type MessageBlock
} from './components/BotUIMessage.js'