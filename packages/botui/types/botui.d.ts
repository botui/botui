import { BlockData, BlockMeta, BlockManager } from './block';
import { Plugin } from './plugin';
export interface BotuiInterface {
    message: BlockManager;
    use(plugin: Plugin): BotuiInterface;
    next(...args: any[]): BotuiInterface;
    wait(meta: BlockMeta): Promise<void>;
    action(data: BlockData, meta: BlockMeta): Promise<void>;
    onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface;
}
export declare type CallbackFunction = (...args: any[]) => {};
export declare enum BlockTypes {
    'ACTION' = "action",
    'MESSAGE' = "message"
}
export declare const BOTUI_TYPES: typeof BlockTypes;
export declare const botuiControl: () => BotuiInterface;
