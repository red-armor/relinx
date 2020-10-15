import { AutoRunnerProps } from './types';
declare class AutoRunner {
    private _isDirty;
    paths: Array<Array<string>>;
    autoRunFn: Function;
    id: string;
    removers: Array<Function>;
    constructor({ paths, autoRunFn }: AutoRunnerProps);
    addRemover(remover: Function): void;
    teardown(): void;
    markDirty(): void;
    markClean(): void;
    isDirty(): boolean;
    triggerAutoRun(): any;
}
export default AutoRunner;
