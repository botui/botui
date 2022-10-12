import { BlockData, BlockMeta, BlockManager, WithWildcards } from './block';
import { Plugin } from './plugin';
import { ActionInterface } from './action';
declare type WaitOptions = {
    waitTime?: number;
};
export interface BotuiInterface {
    message: BlockManager;
    action: ActionInterface;
    use(plugin: Plugin): BotuiInterface;
    next(...args: any[]): BotuiInterface;
    wait(meta: WaitOptions, forwardData?: BlockData, forwardMeta?: BlockMeta): Promise<WithWildcards<{}> | void>;
    onChange(state: BlockTypes, callback: CallbackFunction): BotuiInterface;
}
export declare type CallbackFunction = (...args: any[]) => void;
export declare enum BlockTypes {
    'ACTION' = "action",
    'MESSAGE' = "message"
}
export declare const BOTUI_BLOCK_TYPES: typeof BlockTypes;
export declare const createBot: () => BotuiInterface;
export {};
