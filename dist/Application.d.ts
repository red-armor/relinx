import PathNode from './PathNode';
import { IApplication, GenericState, PendingPatcher, UpdateValue } from './types';
import Patcher from './Patcher';
declare class Application<T, K extends keyof T> implements IApplication<T, K> {
    base: GenericState<T, K>;
    node: PathNode;
    pendingPatchers: Array<PendingPatcher>;
    namespace: string;
    strictMode: boolean;
    constructor({ base, namespace, strictMode, }: {
        base: GenericState<T, K>;
        namespace: string;
        strictMode: boolean;
    });
    update(values: Array<UpdateValue<K>>): void;
    updateBase({ storeKey, changedValue, }: {
        storeKey: keyof K;
        changedValue: object;
    }): void;
    treeShake({ storeKey, changedValue, }: {
        storeKey: keyof K;
        changedValue: object;
    }): void;
    addPatcher(patcher: Patcher): void;
    getStoreData(storeName: keyof K): T[K];
}
export default Application;
