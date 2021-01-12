import Patcher from '../Patcher';
import { BasicModelType } from './createStore';
import AutoRunner from '../AutoRunner';
import Store from '../Store';

export type IApplication<T extends BasicModelType<T>> = {
  store: Store<T, keyof T>;
  namespace: string;
  strictMode: boolean;
};

export interface PendingPatcher {
  patcher: Patcher;
  updateType: UPDATE_TYPE;
}

export interface PendingAutoRunner {
  autoRunner: AutoRunner;
  updateType: UPDATE_TYPE;
  storeKey: string;
}

export interface Operation {
  path: Array<string>;
  isDelete: Boolean;
}

export enum UPDATE_TYPE {
  ARRAY_LENGTH_CHANGE = 'array_length_change',
  BASIC_VALUE_CHANGE = 'basic_value_change',
}
