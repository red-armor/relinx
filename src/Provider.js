import React, {
  useMemo,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import context from './context'
import central from './tracker/central'
import infoLog from './utils/infoLog'

const DEBUG = false

export default ({ store, children, namespace = 'default' }) => {
  const { initialState, createReducer, createDispatch } = store
  // TODO: for log
  // const nonReactiveInitialState = useMemo(() => deepCopy(initialState), [])
  const nonReactiveInitialState = initialState
  const initialized = useRef({})

  if (!initialized.current[namespace]) {
    central.setBase(initialState, namespace)
    initialized.current[namespace] = true
  }

  const combinedReducers = useMemo(() => createReducer(nonReactiveInitialState), [])
  const [value, setValue] = useReducer(combinedReducers, [{
    storeKey: '',
    changedValue: {},
  }])

  let setState = setValue

  if (DEBUG) {
    setState = (...args) => {
      infoLog('Dispatch Action ', ...args)
      setValue(...args)
    }
  }

  const dispatch = useMemo(() => createDispatch(setState), [])

  useEffect(() => {
    try {
      value.forEach(currentValue => {
        const { storeKey, changedValue = {} } = currentValue
        const keys = Object.keys(changedValue)
        keys.forEach(key => {
          central.reconcileWithPaths([storeKey, key], changedValue[key], namespace)
        })
      })
    } catch (err) {
      console.error(err) // eslint-disable-line
    }
  }, [value])

  if (DEBUG) {
    infoLog('central : ', central)
  }

  // Context only need to pass `dispatch`, state value could get
  // from isolate `useTracker` instance
  const propagatedValue = useMemo(() => ({
    computation: null,
    namespace,
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}
