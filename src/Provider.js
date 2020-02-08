import React, { useMemo, useRef, useReducer, useEffect } from 'react'
import context from './context'
import ApplicationImpl from './ApplicationImpl'
import { generateNamespaceKey } from './utils/key'

export default ({
  store,
  children,
  useProxy = true,
  namespace,
}) => {
  const { initialState, createReducer, createDispatch } = store
  const application = useRef(new ApplicationImpl(initialState))

  const combinedReducers = useMemo(() => createReducer(initialState), [])
  // no need to update value every time.
  const [value, setValue] = useReducer(combinedReducers, [])
  let setState = setValue
  const dispatch = useMemo(() => createDispatch(setState), [])

  useEffect(() => {
    application.current.update(value)
  }, [value])

  const contextValue = useRef({
    application: application.current,
    dispatch,
    useProxy,
    namespace: namespace || generateNamespaceKey(),
  })

  return (
    <context.Provider value={contextValue.current}>
      {children}
    </context.Provider>
  )
}
