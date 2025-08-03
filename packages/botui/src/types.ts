// ===================================
// BOTUI CORE TYPES & INTERFACES
// ===================================
// All types (T*) and interfaces (I*) consolidated here
// Event names use enums for better type safety

// =============================================================================
// BASIC TYPES
// =============================================================================

export type TActionId = string

// Legacy wildcard system for maximum extensibility
export type TWithWildcards<T> = T & { [key: string]: unknown }

export type TBlockMeta = TWithWildcards<{
  previous?: IBlock
}>

export type TBlockData = TWithWildcards<{}>

export type THistory = IBlock[]

export type TPlugin = (block: IBlock) => IBlock

export type TWaitOptions = {
  /** how long should it wait for? in milliseconds */
  waitTime: number
}

export type TCallbackFunction = (...args: any[]) => void

// Internal event emitter types
export type TListener<T> = (data: T) => void
export type TEventMap = { [K in keyof IBotUIEvents]: TListener<IBotUIEvents[K]>[] }

// =============================================================================
// INTERFACES
// =============================================================================

export interface IBlock {
  key: number
  type: string
  meta: TBlockMeta
  data: TBlockData
}

export interface IBlockManager {
  add(data: TBlockData, meta?: TBlockMeta): Promise<number>
  setAll(blocks: IBlock[]): Promise<IBlock[]>
  getAll(): Promise<IBlock[]>
  get(key: number): Promise<IBlock>
  remove(key: number): Promise<void>
  update(key: number, data: TBlockData, meta?: TBlockMeta): Promise<void>
  removeAll(): Promise<void>
  stream(source: any, config?: any): Promise<any>
}

export interface IActionInterface {
  get: () => Promise<IBlock>
  set: (data: TBlockData, meta?: TBlockMeta) => Promise<any>
}

export interface IBotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: TActionId
}

// =============================================================================
// ENUMS
// =============================================================================

export enum EBlockTypes {
  ACTION = 'action',
  MESSAGE = 'message',
}

export enum EBotUIEvents {
  MESSAGE_ADD = 'message.add',
  MESSAGE_UPDATE = 'message.update',
  MESSAGE_REMOVE = 'message.remove',
  MESSAGE_CLEAR = 'message.clear',
  ACTION_SHOW = 'action.show',
  ACTION_RESOLVE = 'action.resolve',
  ACTION_CLEAR = 'action.clear',
  BOT_BUSY = 'bot.busy',
  ERROR_OCCURRED = 'error.occurred',
  ERROR_CLEAR = 'error.clear',
  PLUGIN_APPLIED = 'plugin.applied',
  STREAM_START = 'stream.start',
  STREAM_PROGRESS = 'stream.progress',
  STREAM_ERROR = 'stream.error',
  STREAM_COMPLETE = 'stream.complete',
  STREAM_CANCEL = 'stream.cancel',
}

// =============================================================================
// EVENT INTERFACES
// =============================================================================

export interface IBotUIEvents {
  [EBotUIEvents.MESSAGE_ADD]: IBlock
  [EBotUIEvents.MESSAGE_UPDATE]: { id: string; block: IBlock }
  [EBotUIEvents.MESSAGE_REMOVE]: { id: string }
  [EBotUIEvents.MESSAGE_CLEAR]: void
  [EBotUIEvents.ACTION_SHOW]: IBlock  // Actions ARE blocks, not separate interface
  [EBotUIEvents.ACTION_RESOLVE]: any[]  // Raw args passed to next() - extensible
  [EBotUIEvents.ACTION_CLEAR]: void
  /**
   * Indicates busy/loading state
   * - 'bot': Bot is processing (generating response, API calls, etc.)
   * - 'human': User is typing or interacting
   * - 'system': System operations (loading, initializing, etc.)
   */
  [EBotUIEvents.BOT_BUSY]: { busy: boolean; source: 'bot' | 'human' | 'system' }
  [EBotUIEvents.ERROR_OCCURRED]: IBotUIError
  [EBotUIEvents.ERROR_CLEAR]: void
  [EBotUIEvents.PLUGIN_APPLIED]: { pluginName: string; block: IBlock }
  [EBotUIEvents.STREAM_START]: { messageKey: number; sourceType: string }
  [EBotUIEvents.STREAM_PROGRESS]: { messageKey: number; text: string; updateCount: number; duration: number }
  [EBotUIEvents.STREAM_ERROR]: { messageKey: number; error: Error; sourceType: string }
  [EBotUIEvents.STREAM_COMPLETE]: { messageKey: number; finalText: string; updateCount: number; duration: number }
  [EBotUIEvents.STREAM_CANCEL]: { messageKey: number; reason?: string }
}

export interface IEventEmitter {
  on<K extends keyof IBotUIEvents>(event: K, listener: (data: IBotUIEvents[K]) => void): void
  off<K extends keyof IBotUIEvents>(event: K, listener: (data: IBotUIEvents[K]) => void): void
  emit<K extends keyof IBotUIEvents>(event: K, data: IBotUIEvents[K]): void
}

export interface IBotuiInterface extends IEventEmitter {
  message: IBlockManager
  action: IActionInterface
  use(plugin: TPlugin): IBotuiInterface
  next(...args: any[]): IBotuiInterface
  wait(): Promise<any>
  wait(
    waitOptions: TWaitOptions,
    forwardData?: TBlockData,
    forwardMeta?: TBlockMeta
  ): Promise<TBlockData>
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const BOTUI_BLOCK_TYPES = EBlockTypes