import { createContext } from 'react';
import { ContextDefaultValue } from './types';
import Store from './Store';

const calculateChangeBits = () => 0b00;
const noop = () => {};

export const defaultValue = {
  computation: null,
  dispatch: noop,
  attachStoreName: noop,
  useProxy: true,
  namespace: null,
  patcher: null,
  trackerNode: null,
  useRelinkMode: true,
  store: Store,
};

// @ts-ignore
export default createContext<ContextDefaultValue<T, M>>(
  defaultValue,
  // @ts-ignore
  calculateChangeBits
);
