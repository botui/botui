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

/**
 * Creates a new block object with the specified type, metadata, and data.
 *
 * @param {string} type - The type of the block (e.g., 'message', 'action')
 * @param {TBlockMeta} meta - Metadata associated with the block
 * @param {TBlockData} data - The block's data content
 * @param {number} [key] - Optional unique key for the block
 * @returns {IBlock} A new block object
 *
 * @example
 * ```typescript
 * import { createBlock, EBlockTypes } from 'botui'
 *
 * const messageBlock = createBlock(
 *   EBlockTypes.MESSAGE,
 *   { timestamp: Date.now() },
 *   { text: 'Hello, world!' }
 * )
 * ```
 */
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

/**
 * Creates a block manager for handling block history and operations.
 * Manages the listed blocks in the UI, but not the current action.
 *
 * @param {Function} [callback] - Optional callback function called when history changes
 * @returns {Object} Block manager object with methods for managing blocks
 *
 * @example
 * ```typescript
 * import { blockManager } from 'botui'
 *
 * const blocks = blockManager((history, operation, block) => {
 *   console.log('History updated:', history, 'Operation:', operation, 'Block:', block)
 * })
 *
 * // Add a block
 * const key = blocks.add(myBlock)
 *
 * // Get all blocks
 * const allBlocks = blocks.getAll()
 *
 * // Update a block
 * blocks.update(key, updatedBlock)
 * ```
 */
export function blockManager(callback = (history: THistory = [], operation?: string, block?: IBlock) => {}) {
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
    /**
     * Gets all blocks in the history.
     *
     * @returns {THistory} Array of all blocks
     */
    getAll: () => history,

    /**
     * Sets all blocks in the history, replacing existing blocks.
     *
     * @param {IBlock[]} blocks - Array of blocks to set as the new history
     * @returns {void}
     */
    setAll: (blocks: IBlock[]) => {
      blocks.forEach((block) => insertBlock({ ...block })) // copied, to not to write to orignal
      callback(history, 'setAll')
    },

    /**
     * Gets a single block by its key.
     *
     * @param {number} key - The key of the block to retrieve
     * @returns {IBlock} The block with the specified key
     */
    get: (key: number) => {
      return history[getBlockIndexByKey(key)]
    },

    /**
     * Adds a new block to the history.
     *
     * @param {IBlock} block - The block to add
     * @returns {number} The key assigned to the added block
     */
    add: (block: IBlock): number => {
      const key = insertBlock(block)
      callback(history, 'add', block)
      return key
    },

    /**
     * Updates an existing block by its key.
     *
     * @param {number} key - The key of the block to update
     * @param {IBlock} block - The new block data
     * @returns {void}
     */
    update: (key: number, block: IBlock): void => {
      const index = getBlockIndexByKey(key)
      history[index] = block
      callback(history, 'update', block)
    },

    /**
     * Removes a block from the history by its key.
     *
     * @param {number} key - The key of the block to remove
     * @returns {void}
     */
    remove: (key: number): void => {
      const index = getBlockIndexByKey(key)
      const removedBlock = history[index]
      history.splice(index, 1)
      callback(history, 'remove', removedBlock)
    },

    /**
     * Clears all blocks from the history.
     *
     * @returns {void}
     */
    clear: (): void => {
      history = []
      callback(history, 'clear')
    },
  }
}