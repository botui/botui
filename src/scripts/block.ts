
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
  key: number,
  type: string
  meta: BlockMeta
  data: BlockData
}

export interface BlockManager {
  add(data: BlockData, meta: BlockMeta): Promise<number>
  getAll(): Promise<Block[]>
  get(key: number): Promise<Block>
  remove(key: number): Promise<void>
  update(key: number, data: BlockData, meta: BlockMeta): Promise<void>
  removeAll(): Promise<void>
}

export function createBlock(type: string, meta: BlockMeta, data: BlockData, key?: number): Block {
  return {
    key: key ?? -1,
    type: type,
    meta: meta,
    data: data,
  }
}

// it only manages the listed blocks in the UI, not the action.
export function blockManager(callback = (history: History = []) => {}) {
  let history: History = []
  const getBlockIndexByKey = (key = -1) => history.findIndex(block => block.key === key)

  return {
    getAll: () => history,
    get: (key: number) => {
      return history[getBlockIndexByKey(key)]
    },
    add: (block: Block): number => {
      const length = history.length
      block.key = length
      history.push(block)
      callback(history)
      return length
    },
    update: (key: number, block: Block): void => {
      const index = getBlockIndexByKey(key)
      history[index] = block
      callback(history)
    },
    remove: (key: number): void => {
      const index = getBlockIndexByKey(key)
      history.splice(index, 1)
      callback(history)
    },
    clear: (): void => {
      history = []
      callback(history)
    },
  }
}