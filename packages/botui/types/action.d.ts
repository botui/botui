import type { Block, BlockData, BlockMeta, WithWildcards } from './block';
export interface ActionInterface {
    get: () => Promise<Block>;
    set: (data: BlockData, meta: BlockMeta) => Promise<WithWildcards<{}>>;
}
export declare function actionManager(callback?: (action: Block | null) => void): {
    get: () => Block;
    set: (action: Block) => void;
    clear: () => void;
};
