import { HydrateConfig, IProxyTracker, IES5Tracker, TrackerNodeConstructorProps } from './types';
declare class TrackerNode {
    base: object;
    useRevoke: boolean;
    useScope: boolean;
    useProxy: boolean;
    rootPath: Array<string>;
    children: Array<any>;
    parent: null | TrackerNode;
    prevSibling: null | TrackerNode;
    nextSibling: null | TrackerNode;
    proxy: null | IProxyTracker | IES5Tracker;
    id: string;
    isRevoked: boolean;
    inScope: boolean;
    constructor({ parent, isSibling, base, useRevoke, useScope, useProxy, rootPath, }: TrackerNodeConstructorProps);
    updateParent(): void;
    enterTrackerScope(): void;
    enterContext(): void;
    leaveContext(): void;
    initPrevSibling(): void;
    destroy(): void;
    contains(childNode: TrackerNode): boolean;
    revokeLastChild(): void;
    /**
     *
     * @param {null | TrackerNode} parent, null value means revoke until to top most.
     */
    revokeUntil(parent?: TrackerNode): boolean;
    revokeSelf(): boolean;
    /**
     * return context handler to parent node.
     */
    revoke(): void;
    hydrate(base: object, config?: HydrateConfig): void;
}
export default TrackerNode;
