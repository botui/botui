// even though the file has .ts extension, we need to use .js for resolution.

// Core components
export * from './BotUI.js'
export * from './BotUIAction.js'
export * from './BotUIMessage.js'

// Note: Redundant wrapper components have been removed to eliminate duplication.
// Use the built-in renderers exported below instead of individual component wrappers.

// Core renderer functionality has been consolidated into main components

// Export built-in renderers with explicit names to avoid conflicts
export {
  builtInMessageRenderers,
  BuiltInTextRenderer,
  BuiltInImageRenderer,
  BuiltInEmbedRenderer,
  BuiltInLinksRenderer,
  BotUIMessageLinks,
  ActionLinksData,
} from './renderers/MessageRenderers.js'

export {
  builtInActionRenderers,
  BuiltInWaitRenderer,
  BuiltInTextRenderer as BuiltInActionTextRenderer,
  BuiltInSelectRenderer,
  BuiltInSelectButtonsRenderer,
  ActionSelectOption,
  ActionSelectData,
  BotUIActionSelectReturns,
  BotUIActionSelectButtonsReturns,
  BotUIButton,
  BotUICancelButton,
  BotUIButtonTypes,
  BotUICancelButtonTypes,
} from './renderers/ActionRenderers.js'
