import React, {
  useMemo,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import context from './context'
import central from './tracker/central'

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
    try {
      value.forEach(currentValue => {
        const { storeKey, changedValue = {}} = currentValue
        const keys = Object.keys(changedValue)
        keys.forEach(key => {
          central.reconcileWithPaths([storeKey, key], changedValue[key])
        })
      })
    } catch(err) {
      console.error(err)
    }
  }, [value])

  // Context only need to pass `dispatch`, state value could get from isolate `useTracker` instance
  const propagatedValue = useMemo(() => ({
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}