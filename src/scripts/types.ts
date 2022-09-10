import { Plugin } from './plugin'

export interface Block {
  type: string
  meta: BlockMeta
  data: BlockData
}

export interface BlockManager {
  add(data: BlockData, meta: BlockMeta): Promise<number>
  getAll(): Promise<Block[]>
  get(index: number): Promise<Block>
  remove(index: number): Promise<void>
  update(index: number, block: Block): Promise<void>
  removeAll(): Promise<void>
}
export interface BotuiInterface {
  message: BlockManager
  use(plugin: Plugin): BotuiInterface
  next(...args: any[]): BotuiInterface
  wait(meta: BlockMeta): Promise<void>
  action(data: BlockData, meta: BlockMeta): Promise<void>
  onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface
}

export type BlockMeta = {
  type?: string
  waitTime?: number
  waiting?: boolean
  ephemeral?: boolean
  previous?: object
}

export type BlockData = object
export type History = Block[]
export type CallbackFunction = (...args: any[]) => {}

export enum BlockTypes {
  'ACTION' = 'action',
  'MESSAGE' = 'message',
}
