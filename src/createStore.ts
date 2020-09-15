import Store from './Store';

import {
  CreateStoreOnlyModels,
  EnhanceFunction,
  BasicModelType,
} from './types';

export default function createStore<
  T extends BasicModelType<T>,
  MODEL_KEY extends keyof T = keyof T
>(
  configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in MODEL_KEY]?: any;
    };
  },
  enhancer?: EnhanceFunction
): Store<T> {
  if (typeof enhancer === 'function') {
    return enhancer<T, MODEL_KEY>(createStore)(configs);
  }

  return new Store(configs);
}
