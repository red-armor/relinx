import Patcher from './Patcher';
import AutoRunner from './AutoRunner';
declare type Children = {
    [key: string]: PathNode;
};
declare type ToHandlerMap<T> = T extends Field.Patchers ? Patcher : AutoRunner;
declare enum Field {
    Patchers = "patchers",
    AutoRunners = "autoRunners"
}
declare class PathNode {
    private parent;
    patchers: Array<Patcher>;
    autoRunners: Array<AutoRunner>;
    children: Children;
    private prop;
    constructor(prop?: string, parent?: PathNode);
    addPatcher(path: Array<string>, patcher: Patcher): void;
    destroyPatcher(): void;
    addAutoRunner(path: Array<string>, autoRunner: AutoRunner): void;
    destroyAutoRunner(): void;
    getCollection<T extends Field>(field: T): Array<Patcher> | Array<AutoRunner>;
    addPathNode<T extends Field>(path: Array<string>, handler: ToHandlerMap<T>, field: T): void;
    destroyPathNode(): void;
}
export default PathNode;
