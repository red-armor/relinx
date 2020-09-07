import TrackerNode from '../TrackerNode';
import { IProxyTracker } from './proxyTracker';
import { IES5Tracker } from './es5Tracker';
export { TrackerNode };
export interface TrackerNodeConstructorProps {
    parent: null | TrackerNode;
    isSibling: boolean;
    base: object;
    useRevoke: boolean;
    useScope: boolean;
    useProxy: boolean;
    rootPath: Array<string>;
}
export interface HydrateConfig {
    rootPath?: Array<string>;
}
export declare type TrackerProxy = IProxyTracker | IES5Tracker;
