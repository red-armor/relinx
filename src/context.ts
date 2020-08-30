import { createContext } from 'react';

const calculateChangeBits = () => 0b00;

const defaultValue = {
  computation: null,
  dispatch: () => {},
};

// @ts-ignore
export default createContext(defaultValue, calculateChangeBits);
