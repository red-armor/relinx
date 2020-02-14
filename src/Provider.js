import React, {
  useMemo,
  useRef,
  useReducer,
  useEffect,
} from 'react'
import context from './context'
import Application from './Application'
import { generateNamespaceKey } from './utils/key'

export default ({
  store,
  children,
  namespace,
  useProxy = true,
  useRelinkMode = true,
}) => {
  const { initialState, createReducer, createDispatch } = store
  const namespaceRef = useRef(namespace || generateNamespaceKey())
  const application = useRef(
    new Application({
      base: initialState,
      namespace: namespaceRef.current,
    })
  )

  const combinedReducers = useMemo(() => createReducer(initialState), [])
  // no need to update value every time.
  const [value, setValue] = useReducer(combinedReducers, [])
  const setState = setValue
  const dispatch = useMemo(() => createDispatch(setState), [])

  useEffect(() => {
    application.current.update(value)
  }, [value])

  const contextValue = useRef({
    dispatch,
    useProxy,
    useRelinkMode,
    namespace: namespaceRef.current,
    application: application.current,
  })

  return (
    <context.Provider value={contextValue.current}>
      {children}
    </context.Provider>
  )
}
