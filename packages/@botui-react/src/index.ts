// Modern headless React components for BotUI
// Inspired by headlessui - maximum flexibility with easy patterns

import React from 'react'

export * from './hooks/index.js'
export * from './components/index.js'

// Export types for convenience
export type { Renderer } from './types.js'

// Export context
export { BotUIProvider, useBotUIContext } from './context/BotUIContext.js'

// Re-export core types from botui - no React-specific abstractions
export type {
  IBlock,
  TBlockData,
  TBlockMeta,
  IBotUIError,
  IBotuiInterface,
  EBotUIEvents,
  EBlockTypes
} from '../../botui/src/types.js'
export type {
  StreamingMessage,
  StreamingOptions
} from '../../botui/src/streaming.js'