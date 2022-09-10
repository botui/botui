
export interface Block {
  type: string
  meta: blockMeta
  data: blockData
}

export interface BlockManager {
  add (data: blockData, meta: blockMeta): Promise<number>
  getAll (): Promise<Block[]>
  get (index: number): Promise<Block>
  remove (index: number): Promise<void>
  update (index: number, block: Block): Promise<void>
  removeAll (): Promise<void>
}
export interface BotuiInterface {
  message: BlockManager
  use (plugin: plugin): BotuiInterface
  next (...args: any[]): BotuiInterface
  wait (meta: blockMeta): Promise<void>
  action (data: blockData, meta: blockMeta): Promise<void>
  onChange (state: BotuiTypes, cb: callbackFunction): BotuiInterface,
}

export type blockMeta = {
  type?: string
  waitTime?: number
  waiting?: boolean
  ephemeral?: boolean
  previous?: object
}

export type blockData = object
export type History = Block[]
export type plugin = (block: Block) => Block
export type callbackFunction = (...args: any[]) => {}

export enum BotuiTypes {
  'ACTION' = 'action',
  'MESSAGE' = 'message'
}