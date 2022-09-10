export declare type BlockMeta = {
    type?: string;
    waitTime?: number;
    waiting?: boolean;
    ephemeral?: boolean;
    previous?: object;
};
export declare type BlockData = {
    text?: string;
};
export declare type History = Block[];
export interface Block {
    type: string;
    meta: BlockMeta;
    data: BlockData;
}
export interface BlockManager {
    add(data: BlockData, meta: BlockMeta): Promise<number>;
    getAll(): Promise<Block[]>;
    get(index: number): Promise<Block>;
    remove(index: number): Promise<void>;
    update(index: number, block: Block): Promise<void>;
    removeAll(): Promise<void>;
}
export declare function createBlock(type: string, meta: BlockMeta, data: BlockData): Block;
export declare function blockManager(callback?: (history?: History) => void): {
    getAll: () => History;
    get: (index?: number) => Block;
    add: (block: Block) => number;
    update: (index: number, block: Block) => void;
    remove: (index: number) => void;
    clear: () => void;
};
