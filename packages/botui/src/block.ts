export type WithWildcards<T> = T & { [key: string]: unknown }

export type BlockMeta = WithWildcards<{
  previous?: Block
}>

export type BlockData = WithWildcards<{}>
export type History = Block[]

export interface Block {
  key: number
  type: string
  meta: BlockMeta
  data: BlockData
}

export interface BlockManager {
  add(data: BlockData, meta?: BlockMeta): Promise<number>
  setAll(blocks: Block[]): Promise<Block[]>
  getAll(): Promise<Block[]>
  get(key: number): Promise<Block>
  remove(key: number): Promise<void>
  update(key: number, data: BlockData, meta?: BlockMeta): Promise<void>
  removeAll(): Promise<void>
}

export function createBlock(
  type: string,
  meta: BlockMeta,
  data: BlockData,
  key?: number
): Block {
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
  const getBlockIndexByKey = (key = -1) =>
    history.findIndex((block) => block.key === key)
  const insertBlock = (block: Block) => {
    const length = history.length
    block.key = length
    history.push(block)
    return length
  }

  return {
    getAll: () => history,
    setAll: (blocks: Block[]) => {
      blocks.forEach((block) => insertBlock({ ...block })) // copied, to not to write to orignal
      callback(history)
    },
    get: (key: number) => {
      return history[getBlockIndexByKey(key)]
    },
    add: (block: Block): number => {
      const key = insertBlock(block)
      callback(history)
      return key
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
