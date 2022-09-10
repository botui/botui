
export type BlockMeta = {
  type?: string
  waitTime?: number
  waiting?: boolean
  ephemeral?: boolean
  previous?: object
}

export type BlockData = object
export type History = Block[]

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

export function createBlock(type: string, meta: BlockMeta, data: BlockData): Block {
  return {
    type: type,
    meta: meta,
    data: data,
  }
}

export function blockManager(callback = (history: History = []) => {}) {
  let history: History = []

  return {
    getAll: () => history,
    get: (index = 0) => history[index],
    add: (block: Block): number => {
      const length = history.push(block)
      callback(history)
      return length - 1
    },
    update: (index: number, block: Block): void => {
      history[index] = block
      callback(history)
    },
    remove: (index: number): void => {
      history.splice(index, 1)
      callback(history)
    },
    clear: (): void => {
      history = []
      callback(history)
    },
  }
}