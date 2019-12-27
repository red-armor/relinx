import { createContext } from 'react'

const calculateChangeBits = () => 0b00

const defaultValue = {
  computation: null,
  dispatch: () => {}, // eslint-disable-line
}

export default createContext(defaultValue, calculateChangeBits)
