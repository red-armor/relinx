import React from 'react';
import Store from '../Store';
import { BasicModelType } from './createStore';

export interface ProviderProps<
  T extends BasicModelType<T>,
  K extends keyof T = keyof T
> {
  store: Store<T, K>;
  namespace?: string;
  children?: React.ReactNode;
  shouldLogActivity?: boolean;
  shouldLogRerender?: boolean;
  shouldLogChangedValue?: boolean;
}
