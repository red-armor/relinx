import { useContext, useRef } from 'react'
import invariant from 'invariant'
import context from '../context'
import useTracker from '../tracker/useTracker'
import toString from '../utils/toString'

export default storeName => {
  const { dispatch, computation, namespace } = useContext(context)
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

  invariant(
    toString(state.current[storeName]) === '[object Object]',
    'Maybe you are using non-defined store;'
    + `\`storeName\` ${storeName} used in ${computation.name} component should `
    + 'match with exported value from `models/index.js` file'
  )

  return [state.current[storeName], dispatch]
}
