import { AttachStoreName, BasicModelType } from './';
import { Dispatch } from './createStore';
import Store from '../Store';

export interface ContextDefaultValue<T> {
  computation: null;
  dispatch: Dispatch<T>;
  attachStoreName: AttachStoreName;
  useProxy: boolean;
  useScope: boolean;
  namespace: null | string;
  useRelinkMode: boolean;
  componentName?: string;
  $_modelKey?: string;
  store: Store<BasicModelType<T>>;
}
