import { createContext } from 'react';
import { ContextDefaultValue } from './types';

const calculateChangeBits = () => 0b00;
const noop = () => {};

export const defaultValue = {
  computation: null,
  getData: () => ({ trackerNode: null }),
  dispatch: noop,
  attachStoreName: noop,
  useProxy: true,
  namespace: null,
  patcher: null,
  trackerNode: null,
  useRelinkMode: true,
  application: null,
};

// @ts-ignore
export default createContext<ContextDefaultValue<T>>(
  defaultValue,
  calculateChangeBits
);
