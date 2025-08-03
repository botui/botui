// Headless components (core)
import { BotUIRoot } from './BotUIRoot.js'
import { BotUIMessages } from './BotUIMessages.js'
import { BotUIMessage } from './BotUIMessage.js'
import { BotUIActions } from './BotUIActions.js'
import { BotUIVirtual } from './BotUIVirtual.js'

// Rendering components
import { BotUIAction } from './BotUIAction.js'
import { BotUIActionInput } from './BotUIActionInput.js'
import { BotUIActionSelect, BotUIActionSelectButtons } from './BotUIActionSelect.js'
import { BotUIButton, BotUICancelButton } from './BotUIButton.js'
import { BotUIWait } from './BotUIWait.js'
import { BotUIMessageList } from './BotUIMessageList.js'
import {
  BotUIMessage as BotUIMessageRenderer,
  BotUIMessageText,
  BotUIMessageImage,
  BotUIMessageEmbed,
  BotUIMessageLinks,
  BotUIMessageHTML,
  BotUIMessageMarkdown,
  MessageType,
  defaultMessageRenderers
} from './BotUIMessageRenderers.js'
import { SlideFade, BringIntoView, WithRefContext } from './BotUIUtils.js'

// Export headless components (core API)
export { BotUIRoot } from './BotUIRoot.js'
export { BotUIMessages } from './BotUIMessages.js'
export { BotUIMessage } from './BotUIMessage.js'
export { BotUIActions } from './BotUIActions.js'
export { ErrorBoundary } from './ErrorBoundary.js'
export { BotUIVirtual } from './BotUIVirtual.js'

// Export rendering components
export { BotUIAction } from './BotUIAction.js'
export { BotUIActionInput } from './BotUIActionInput.js'
export { BotUIActionSelect, BotUIActionSelectButtons } from './BotUIActionSelect.js'
export { BotUIButton, BotUICancelButton } from './BotUIButton.js'
export { BotUIWait } from './BotUIWait.js'
export { BotUIMessageList } from './BotUIMessageList.js'

// Export message renderers
export {
  BotUIMessageRenderer as BotUIMessageComponent,
  BotUIMessageText,
  BotUIMessageImage,
  BotUIMessageEmbed,
  BotUIMessageLinks,
  BotUIMessageHTML,
  BotUIMessageMarkdown,
  MessageType,
  defaultMessageRenderers
}

// Export utilities
export { SlideFade, BringIntoView, WithRefContext } from './BotUIUtils.js'

// Export as BotUI namespace for dot notation usage (inspired by headlessui)
export const BotUI = {
  // Headless components (render props pattern)
  Root: BotUIRoot,
  Messages: BotUIMessages,
  Message: BotUIMessage,
  Actions: BotUIActions,
  Virtual: BotUIVirtual,

  // Ready-to-use rendering components
  Action: BotUIAction,
  ActionInput: BotUIActionInput,
  ActionSelect: BotUIActionSelect,
  ActionSelectButtons: BotUIActionSelectButtons,
  Button: BotUIButton,
  CancelButton: BotUICancelButton,
  Wait: BotUIWait,
  MessageList: BotUIMessageList,

  // Message renderers
  MessageText: BotUIMessageText,
  MessageImage: BotUIMessageImage,
  MessageEmbed: BotUIMessageEmbed,
  MessageLinks: BotUIMessageLinks,
  MessageHTML: BotUIMessageHTML,
  MessageMarkdown: BotUIMessageMarkdown,
  MessageComponent: BotUIMessageRenderer,

  // Utilities
  SlideFade,
  BringIntoView,
  WithRefContext,
}