import type { Block } from './block';
export declare type Plugin = (block: Block) => Block;
export declare function pluginManager(): {
    registerPlugin: (plugin: Plugin) => Plugin[];
    runWithPlugins: (input: Block) => Block;
};
