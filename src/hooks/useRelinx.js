import { useContext, useState, useEffect } from 'react'
import context from '../context'
import useTracker from '../tracker/useTracker'

export default name => {
  const { dispatch } = useContext(context)
  const [value, setValue] = useState(0)

  // Every `useTracker` will has an isolated state manager; It has two functionality:
  // 1. register reactive `path`
  // 2. reactive to central data change and propagate change to connected context
  const [state, unsubscribe] = useTracker(() => {
    setValue(value + 1)
  }, name)

  // When it comes to `unmount`, computation's listener should be clear.
  useEffect(() => unsubscribe, [])

  return [state, dispatch]
}