import { IProxyTracker, TrackerNode, ProxyTrackerConfig } from './types';
declare function createTracker(target: any, config: ProxyTrackerConfig, trackerNode: TrackerNode): IProxyTracker;
export default createTracker;
