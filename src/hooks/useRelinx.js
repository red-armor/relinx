import { useContext, useState, useEffect, useRef } from 'react'
import context from '../context'
import useTracker from '../tracker/useTracker'

export default (name, reactivePaths) => {
  const { dispatch } = useContext(context)
  const [value, setValue] = useState(0)
  const state = useRef()
  const unsub = useRef(() => {})

  // console.log('reactivePaths : ', reactivePaths)

  // Every `useTracker` will has an isolated state manager; It has two functionality:
  // 1. register reactive `path`
  // 2. reactive to central data change and propagate change to connected context
  const tracker = useTracker(() => {
    setValue(value + 1)
  }, name, reactivePaths)

  state.current = tracker[0]
  unsub.current = tracker[1]

  // When it comes to `unmount`, computation's listener should be clear.
  // Note that use `unsub.current` to get the latest created computation
  useEffect(() => () => unsub.current(), [])

  // The following style is in-corrent; `unsub.current` is the original closure callback;
  // useEffect(() => unsub.current, [])

  return [state.current, dispatch]
}