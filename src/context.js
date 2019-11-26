import { createContext } from 'react'

const calculateChangeBits = () => 0b00

const defaultValue = {
  value: {},
  dispatch: () => {},
}

export default createContext(defaultValue, calculateChangeBits)
