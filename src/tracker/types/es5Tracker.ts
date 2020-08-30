import TrackerNode from '../TrackerNode';
import { Type } from './';
import { InternalFunction } from './';
import { TRACKER } from '../commons';

export interface ES5TrackerConfig {
  accessPath?: Array<string>;
  parentProxy?: IES5Tracker;
  rootPath: Array<string>;
  useRevoke: boolean;
  useScope: boolean;
}

export interface ES5TrackerConstructorProps {
  accessPath: Array<string>;
  parentProxy?: IES5Tracker;
  rootPath: Array<string>;
  base: any;
  trackerNode: TrackerNode;
  useRevoke: Boolean;
  useScope: Boolean;
}

export type ES5TrackerProperties = {
  id: string;
  trackerNode: TrackerNode;
  accessPath: Array<string>;
  rootPath: Array<string>;
  type: Type.Array | Type.Object;
  base: object;
  parentProxy: IES5Tracker;
  childProxies: {
    [key: string]: IES5Tracker;
  };
  isPeeking: Boolean;
  propProperties: Array<any>;
  paths: Array<Array<string>>;
  useRevoke: boolean;
  useScope: boolean;
  isRevoked: boolean;
  assertRevoke: Function;
};
export type ES5TrackerFunctions = InternalFunction;

export type ES5TrackerInterface = ES5TrackerProperties & InternalFunction;

export interface ES5TrackerConstructor {
  new ({
    accessPath,
    parentProxy,
    rootPath,
    base,
    trackerNode,
    useRevoke,
    useScope,
  }: ES5TrackerConstructorProps): ES5TrackerInterface;
}

export interface IES5Tracker {
  [TRACKER]: ES5TrackerInterface;

  getProps(args: Array<keyof ES5TrackerInterface>): any;
  getProp(args: keyof ES5TrackerInterface): any;
  setProp(key: keyof ES5TrackerInterface, value: any): boolean;
  runFn(key: keyof ES5TrackerInterface, ...rest: Array<any>): any;
  unlink(): any;
  createChild(): any;
  revoke(): void;
  [key: string]: any;
}
