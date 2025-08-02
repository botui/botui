import type {
  TWithWildcards,
  TBlockMeta,
  TBlockData,
  THistory,
  IBlock,
  IBlockManager
} from './types.js'

// Re-export types for backward compatibility
export type {
  TWithWildcards as WithWildcards,
  TBlockMeta as BlockMeta,
  TBlockData as BlockData,
  THistory as History,
  IBlock as Block,
  IBlockManager as BlockManager
}

export function createBlock(
  type: string,
  meta: TBlockMeta,
  data: TBlockData,
  key?: number
): IBlock {
  return {
    key: key ?? -1,
    type: type,
    meta: meta,
    data: data,
  }
}

// it only manages the listed blocks in the UI, not the action.
export function blockManager(callback = (history: THistory = []) => {}) {
  let history: THistory = []
  const getBlockIndexByKey = (key = -1) =>
    history.findIndex((block) => block.key === key)
  const insertBlock = (block: IBlock) => {
    const length = history.length
    block.key = length
    history.push(block)
    return length
  }

  return {
    getAll: () => history,
    setAll: (blocks: IBlock[]) => {
      blocks.forEach((block) => insertBlock({ ...block })) // copied, to not to write to orignal
      callback(history)
    },
    get: (key: number) => {
      return history[getBlockIndexByKey(key)]
    },
    add: (block: IBlock): number => {
      const key = insertBlock(block)
      callback(history)
      return key
    },
    update: (key: number, block: IBlock): void => {
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