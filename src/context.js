import { createContext } from 'react'

const calculateChangeBits = () => 0b00
const defaultValue = {
  value: {},
  dispatch: () => {},
}
const context = createContext(defaultValue, calculateChangeBits)

export default context
