import React, {
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'
import context from './context'
import tracker from './tracker'

const subscription = {}

export default (WrappedComponent) => {
  function NextComponent(props) {
    const [state, setState] = useState(0)
    const tracker = useRef()
    const teardown = []

    const autoRunFn = useCallback(() => {
      setState(state + 1)
    }, [state])

    useEffect(() => {
      const remarkablePaths = tracker.getRemarkablePaths()
      const teardown = remarkablePaths.map(path => {
        subscription.addListener(path, namespace, )
      })

      return () => {

      }
    })

    return (
      <React.Fragment>
        <WrappedComponent {...props} />
        <ResetComputationHelper />
      </React.Fragment>
    )
  }

  NextComponent.displayName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'ObservedComponent'

  return NextComponent
}
