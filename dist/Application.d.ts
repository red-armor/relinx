import PathNode from './PathNode';
import { IApplication, GenericState, PendingPatcher, ChangedValueGroup } from './types';
import Patcher from './Patcher';
declare class Application<T, K extends keyof T> implements IApplication<T, K> {
    base: GenericState<T, K>;
    node: PathNode;
    pendingPatchers: Array<PendingPatcher>;
    namespace: string;
    strictMode: boolean;
    proxyState: any;
    constructor({ base, namespace, strictMode, }: {
        base: GenericState<T, K>;
        namespace: string;
        strictMode: boolean;
    });
    update(values: Array<ChangedValueGroup<K>>): void;
    updateBase({ storeKey, changedValue, }: {
        storeKey: K;
        changedValue: object;
    }): void;
    addPatchers(patchers: Array<Patcher>): void;
    /**
     *
     * Recently it only support `Array`, `Object`, `Number`, `String` and `Boolean` five
     * types..
     */
    treeShake({ storeKey, changedValue }: {
        storeKey: K;
        changedValue: object;
    }): void;
    addPatcher(patcher: Patcher): void;
    getStoreData(storeName: K): T[K];
}
export default Application;
