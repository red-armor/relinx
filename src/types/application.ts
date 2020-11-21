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
  updateType: UPDATE_TYPE;
  // operation: Array<Operation>;
}

export interface PendingAutoRunner {
  autoRunner: AutoRunner;
  updateType: UPDATE_TYPE;
}

export interface Operation {
  path: Array<string>;
  isDelete: Boolean;
}

export enum UPDATE_TYPE {
  ARRAY_LENGTH_CHANGE = 'array_length_change',
  BASIC_VALUE_CHANGE = 'basic_value_change',
}
