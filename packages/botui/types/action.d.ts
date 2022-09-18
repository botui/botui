import type { Block, BlockData, BlockMeta } from './block';
export interface ActionInterface {
    get: () => Promise<Block>;
    set: (data: BlockData, meta: BlockMeta) => Promise<void>;
}
export declare function actionManager(callback?: (action: Block | null) => void): {
    get: () => Block;
    set: (action: Block) => void;
    clear: () => void;
};
