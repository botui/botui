import type { Block } from './block';
export declare function actionManager(callback?: (action: Block | null) => void): {
    get: () => Block;
    set: (action: Block) => void;
    clear: () => void;
};
