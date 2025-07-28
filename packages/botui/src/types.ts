export type MessageId = string
export type ActionId = string

export interface Bot extends EventEmitter {
  readonly id: string
  message(content: MessageContent): Promise<void>
  action(actionDef: ActionDefinition): Promise<ActionResult>
  destroy(): void
}

export interface Message {
  readonly id: MessageId
  readonly content: MessageContent
  readonly timestamp: Date
  readonly type: 'bot' | 'human'
  readonly metadata?: Record<string, unknown>
}

export type MessageContent = string | React.ReactNode

export interface ActionDefinition {
  readonly type: 'input' | 'select'
  readonly id: ActionId
  readonly placeholder?: string
  readonly options?: SelectOption[]
}

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export interface ActionResult {
  readonly value: string
  readonly option?: SelectOption
}

export interface BotUIError {
  readonly type: 'network' | 'validation' | 'bot-script' | 'unexpected'
  readonly message: string
  readonly cause?: Error
  readonly actionId?: ActionId
}

export interface BotUIEvents {
  'message.add': Message
  'action.show': ActionDefinition
  'action.resolve': ActionResult
  'typing.set': boolean
  'error.occurred': BotUIError
}

// EventEmitter interface
export interface EventEmitter {
  on<K extends keyof BotUIEvents>(event: K, listener: (data: BotUIEvents[K]) => void): void
  off<K extends keyof BotUIEvents>(event: K, listener: (data: BotUIEvents[K]) => void): void
  emit<K extends keyof BotUIEvents>(event: K, data: BotUIEvents[K]): void
}