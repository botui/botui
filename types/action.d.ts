import type { Block } from './block';
export declare function actionManager(callback?: (action: Block | null) => void): {
    set: (action: Block) => void;
    clear: () => void;
};
