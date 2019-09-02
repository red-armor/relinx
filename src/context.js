import React from 'react'
import { create } from 'domain';

const defaultChangedBits = (nextValue, oldValue) => {
  return 0b0
}

const createContext = (
  initialValue,
  calculateChangedBits = defaultChangedBits
) => {
  return React.createContext(initialValue, calculateChangedBits)
}

export default createContext