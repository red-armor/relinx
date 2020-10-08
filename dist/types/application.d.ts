import PathNode from '../PathNode';
import Patcher from '../Patcher';
import { GenericState } from './';
export declare type IApplication<T, K extends keyof T> = {
    base: GenericState<T, K>;
    node: PathNode;
    pendingPatchers: Array<PendingPatcher>;
    namespace: string;
    strictMode: boolean;
};
export interface PendingPatcher {
    patcher: Patcher;
}
export interface Operation {
    path: Array<string>;
    isDelete: Boolean;
}
