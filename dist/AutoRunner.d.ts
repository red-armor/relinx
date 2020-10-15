import { AutoRunnerProps, Action } from './types';
declare class AutoRunner {
    private _isDirty;
    paths: Array<Array<string>>;
    autoRunFn: Function;
    id: string;
    removers: Array<Function>;
    modelKey: string;
    constructor({ paths, autoRunFn, modelKey }: AutoRunnerProps);
    addRemover(remover: Function): void;
    teardown(): void;
    markDirty(): void;
    markClean(): void;
    isDirty(): boolean;
    triggerAutoRun(): Action[];
}
export default AutoRunner;
