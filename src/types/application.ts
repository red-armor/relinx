import PathNode from '../PathNode';
import Patcher from '../Patcher';
import { GenericState } from './';
import AutoRunner from '../AutoRunner';

export type IApplication<T, K extends keyof T> = {
  base: GenericState<T, K>;
  node: PathNode;
  pendingPatchers: Array<PendingPatcher>;
  namespace: string;
  strictMode: boolean;
};

export interface PendingPatcher {
  // collections: Array<string>;
  patcher: Patcher;
  // operation: Array<Operation>;
}

export interface PendingAutoRunner {
  autoRunner: AutoRunner;
}

export interface Operation {
  path: Array<string>;
  isDelete: Boolean;
}
