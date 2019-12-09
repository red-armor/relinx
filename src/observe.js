import React, {
  useContext, useState, useRef, useEffect,
} from 'react'

import Computation from './tracker/Computation'

import context from './context'
import central from './tracker/central'
import infoLog from './utils/infoLog'

const DEBUG = false

export default WrappedComponent => props => {
  const value = useContext(context)
  const [state, setState] = useState(0)
  const autoRunUpdated = useRef(false)
  const componentName = WrappedComponent.name || WrappedComponent.displayName || 'ObservedComponent'

  const newComputation = new Computation({
    autoRun: () => {
      setState(state + 1)

      if (DEBUG) {
        infoLog(`\`${componentName}\` component updated`)
      }

      autoRunUpdated.current = true
    },
    name: WrappedComponent.name,
    autoRunUpdated: autoRunUpdated.current,
  })
  central.setCurrentComputation(newComputation)

  // When it comes to `unmount`, computation's listener should be clear.
  // Note that use `unsub.current` to get the latest created computation
  useEffect(() => () => {
    newComputation.clear()
  })

  central.flush()

  useEffect(() => {
    central.flush()
    if (autoRunUpdated.current) {
      autoRunUpdated.current = false
    }
  })

  return (
    <context.Provider
      value={{
        ...value,
        computation: newComputation,
      }}
    >
      <WrappedComponent {...props} />
    </context.Provider>
  )
}
