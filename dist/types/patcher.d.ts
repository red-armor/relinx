export interface IPatcher {
    autoRunFn: Function;
    paths: Array<Array<string>>;
    removers: Array<Function>;
    dirty: boolean;
    id: string;
    displayName: string;
    children: Array<any>;
}
export interface PatcherConstructor {
    new ({ paths, autoRunFn, key, parent, displayName, }: {
        paths: Array<Array<string>>;
        autoRunFn: Function;
        key: string;
        parent: PatcherConstructor;
        displayName: string;
    }): IPatcher;
}
