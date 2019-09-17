import React, {
  useMemo,
  useReducer,
  useEffect,
} from 'react'
import context from './context'
import createDeepProxy from './reactive-state/createDeepProxy'

export default ({ store, children }) => {
  const { initialState, createReducer, createDispatch } = store

  const proxyState = useMemo(() => createDeepProxy(initialState), [])
  const combinedReducers = useMemo(() => createReducer(initialState), [])

  const [value, setValue] = useReducer(combinedReducers, [{
    storeKey: '',
    changedValue: {},
  }])

  const dispatch = useMemo(() => createDispatch(setValue))

  useEffect(() => {
    value.forEach(currentValue => {
      const { storeKey, changedValue } = currentValue
      const keys = Object.keys(changedValue)
      keys.forEach(key => {
        proxyState[storeKey][key] = changedValue[key]
      })
    })
  }, [value])

  const propagatedValue = useMemo(() => ({
    value: {
      initialState,
      subscriptions: proxyState.subscriptions,
    },
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}