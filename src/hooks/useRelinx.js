import { useContext, useRef } from 'react'
import invariant from 'invariant'
import context from '../context'
import useTracker from '../tracker/useTracker'

import Tracker from '../tracker'

export default storeName => {
  const {
    dispatch,
    computation,
    namespace,
    bubbleRevokeFn,
  } = useContext(context)

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required to request data source'
  )

  const state = useRef()

  if (!computation) {
    throw new Error('`observe` function is required to be wrapper function')
  }

  // Every `useTracker` will has an isolated state manager; It has two functionality:
  // 1. register reactive `path`
  // 2. reactive to central data change and propagate change to connected context
  const tracker = useTracker(computation, namespace)
  state.current = tracker[0]
  const stateValue = state.current[storeName]

  const { proxy, revoke } = new Tracker({
    base: {},
  })

  bubbleRevokeFn(revoke)

  // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
  invariant(
    !!stateValue,
    `Maybe you are using non-defined store under namespace ${namespace}.\n`
    + `In ${computation ? computation.name || computation.pathNumber : 'root'}`
    + `component, \`storeName\` ${storeName} should `
    + 'match with exported value from `models/index.js` file.'
  )

  return [stateValue, dispatch]
}
