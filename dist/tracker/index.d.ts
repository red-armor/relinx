import TrackerNode from './TrackerNode';
/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
declare const Tracker: ({ base, parent, useProxy, useRevoke, useScope, rootPath, }: {
    base: object;
    parent: null | TrackerNode;
    useProxy: boolean;
    useRevoke: boolean;
    useScope: boolean;
    rootPath: Array<string>;
}) => TrackerNode;
export default Tracker;
