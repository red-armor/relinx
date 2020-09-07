import Patcher from './Patcher';
interface Children {
    [key: string]: PathNode;
}
declare class PathNode {
    private parent;
    patchers: Array<Patcher>;
    children: Children;
    private prop;
    constructor(prop?: string, parent?: PathNode);
    addPathNode(path: Array<string>, patcher: Patcher): void;
    destroyPathNode(): void;
}
export default PathNode;
