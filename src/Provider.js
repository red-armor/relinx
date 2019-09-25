import React, {
  useMemo,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import context from './context'
import central from './reactive-state/central'
import deepCopy from './reactive-state/utils/deepCopy'

export default ({ store, children }) => {
  const { initialState, createReducer, createDispatch } = store
  // TODO: for log
  // const nonReactiveInitialState = useMemo(() => deepCopy(initialState), [])
  const nonReactiveInitialState = initialState
  const initialized = useRef(false)

  if (!initialized.current) {
    central.setBase(initialState)
    initialized.current = true
  }

  const combinedReducers = useMemo(() => createReducer(nonReactiveInitialState), [])
  const [value, setValue] = useReducer(combinedReducers, [{
    storeKey: '',
    changedValue: {},
  }])

  const dispatch = useMemo(() => createDispatch(setValue), [])

  useEffect(() => {
    value.forEach(currentValue => {
      const { storeKey, changedValue } = currentValue
      const keys = Object.keys(changedValue)
      keys.forEach(key => {
        central.reconcileWithPaths([storeKey, key], changedValue[key])
      })
    })
  }, [value])

  const propagatedValue = useMemo(() => ({
    value: {
      initialState: nonReactiveInitialState,
    },
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}