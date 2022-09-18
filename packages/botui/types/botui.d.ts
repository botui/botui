import { BlockMeta, BlockManager } from './block';
import { Plugin } from './plugin';
import { ActionInterface } from './action';
export interface BotuiInterface {
    message: BlockManager;
    action: ActionInterface;
    use(plugin: Plugin): BotuiInterface;
    next(...args: any[]): BotuiInterface;
    wait(meta: BlockMeta): Promise<void>;
    onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface;
}
export declare type CallbackFunction = (...args: any[]) => void;
export declare enum BlockTypes {
    'ACTION' = "action",
    'MESSAGE' = "message"
}
export declare const BOTUI_TYPES: typeof BlockTypes;
export declare const botuiControl: () => BotuiInterface;
