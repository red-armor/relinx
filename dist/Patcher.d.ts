import { IPatcher } from './types';
declare class Patcher implements IPatcher {
    autoRunFn: Function;
    paths: Array<Array<string>>;
    removers: Array<Function>;
    dirty: boolean;
    id: string;
    displayName: string;
    parent: null | Patcher;
    children: Array<any>;
    constructor({ paths, autoRunFn, key, parent, displayName, }: {
        paths: Array<Array<string>>;
        autoRunFn: Function;
        key: string;
        parent: null | Patcher;
        displayName: string;
    });
    destroyPatcher(): void;
    appendTo(parent: null | Patcher): void;
    belongs(parent: null | Patcher): boolean;
    removeChild(child: Patcher): void;
    update({ paths }: {
        paths: Array<Array<string>>;
    }): void;
    addRemover(remover: Function): void;
    teardown(): void;
    markDirty(): void;
    markDirtyAll(): void;
    triggerAutoRun(): void;
}
export default Patcher;
