import TrackerNode from '../TrackerNode';
import { Type } from './';
import { InternalFunction } from './';
import { TRACKER } from '../commons';

export interface ProxyTrackerConfig {
  accessPath?: Array<string>;
  parentProxy?: IProxyTracker;
  rootPath: Array<string>;
  useRevoke: boolean;
  useScope: boolean;
}

export interface ProxyTrackerConstructorProps {
  accessPath: Array<string>;
  parentProxy?: IProxyTracker;
  rootPath: Array<string>;
  base: any;
  trackerNode: TrackerNode;
  useRevoke: boolean;
  useScope: boolean;
}

export interface ProxyTrackerProperties {
  id: string;
  trackerNode: TrackerNode;
  accessPath: Array<string>;
  rootPath: Array<string>;
  type: Type.Array | Type.Object;
  base: {
    [key: string]: any;
  };
  parentProxy: IProxyTracker;
  childProxies: {
    [key: string]: IProxyTracker;
  };
  isPeeking: boolean;
  propProperties: Array<any>;
  paths: Array<Array<string>>;
  useRevoke: boolean;
  useScope: boolean;
}
export type ProxyTrackerFunctions = InternalFunction;

export type ProxyTrackerInterface = ProxyTrackerProperties &
  ProxyTrackerFunctions;

export interface ProxyTrackerConstructor {
  new ({
    accessPath,
    parentProxy,
    rootPath,
    base,
    trackerNode,
    useRevoke,
    useScope,
  }: ProxyTrackerConstructorProps): ProxyTrackerInterface;
}

export interface IProxyTracker {
  [TRACKER]: ProxyTrackerInterface;

  getProps(args: Array<keyof ProxyTrackerInterface>): any;
  getProp(args: keyof ProxyTrackerInterface): any;
  setProp(key: keyof ProxyTrackerInterface, value: any): boolean;
  runFn(key: keyof ProxyTrackerFunctions, ...rest: Array<any>): any;
  unlink(): any;
  createChild(): any;
  revoke(): void;
  [key: string]: any;
}
