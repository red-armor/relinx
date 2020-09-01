import { createContext } from 'react';
import Application from './Application';
import Patcher from './Patcher';
import { TrackerNode } from './tracker/types';

const calculateChangeBits = () => 0b00;
const noop = () => {};

export const defaultValue: {
  computation: null;
  dispatch: Function;
  getData: Function;
  attachStoreName: Function;
  application: null | Application<any, any>;
  useProxy: boolean;
  namespace: null | string;
  patcher: null | Patcher;
  trackerNode: null | TrackerNode;
  useRelinkMode: boolean;
} = {
  computation: null,
  dispatch: noop,
  getData: noop,
  attachStoreName: noop,
  useProxy: true,
  namespace: null,
  patcher: null,
  trackerNode: null,
  useRelinkMode: true,
  application: null,
};

// @ts-ignore
export default createContext(defaultValue, calculateChangeBits);
