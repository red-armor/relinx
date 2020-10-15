import PathNode from './PathNode';
import { Action, IApplication, GenericState, PendingPatcher, PendingAutoRunner, ChangedValueGroup } from './types';
import Patcher from './Patcher';
import { ProxyState } from 'state-tracker';
import AutoRunner from './AutoRunner';
declare class Application<T, K extends keyof T> implements IApplication<T, K> {
    base: GenericState<T, K>;
    node: PathNode;
    autoRunnerNode: PathNode;
    pendingPatchers: Array<PendingPatcher>;
    pendingAutoRunners: Array<PendingAutoRunner>;
    pendingCleaner: Array<Function>;
    namespace: string;
    strictMode: boolean;
    proxyState: ProxyState;
    constructor({ base, namespace, strictMode, }: {
        base: GenericState<T, K>;
        namespace: string;
        strictMode: boolean;
    });
    processAutoRunner(values: Array<ChangedValueGroup<K>>): void;
    update(values: Array<ChangedValueGroup<K>>): void;
    updateDryRun(values: Array<ChangedValueGroup<K>>): Array<Action>;
    updateBase({ storeKey, changedValue, }: {
        storeKey: K;
        changedValue: object;
    }): void;
    addPatchers(patchers: Array<Patcher>): void;
    addAutoRunners(autoRunners: Array<AutoRunner>): void;
    compare(branch: PathNode, baseValue: {
        [key: string]: any;
    }, nextValue: {
        [key: string]: any;
    }, cb: {
        (pathNode: PathNode): void;
    }): void;
    treeShakeAutoRunner({ storeKey, changedValue, }: {
        storeKey: K;
        changedValue: object;
    }): void;
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
    addAutoRunner(autoRunner: AutoRunner): void;
    getStoreData(storeName: K): T[K];
}
export default Application;
