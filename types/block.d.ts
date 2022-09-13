export declare type BlockMeta = {
    type?: string;
    waitTime?: number;
    waiting?: boolean;
    ephemeral?: boolean;
    previous?: object;
};
export declare type BlockData = object;
export declare type History = Block[];
export interface Block {
    key: number;
    type: string;
    meta: BlockMeta;
    data: BlockData;
}
export interface BlockManager {
    add(data: BlockData, meta: BlockMeta): Promise<number>;
    getAll(): Promise<Block[]>;
    get(key: number): Promise<Block>;
    remove(key: number): Promise<void>;
    update(key: number, data: BlockData, meta: BlockMeta): Promise<void>;
    removeAll(): Promise<void>;
}
export declare function createBlock(type: string, meta: BlockMeta, data: BlockData, key?: number): Block;
export declare function blockManager(callback?: (history?: History) => void): {
    getAll: () => History;
    get: (key: number) => Block;
    add: (block: Block) => number;
    update: (key: number, block: Block) => void;
    remove: (key: number) => void;
    clear: () => void;
};
