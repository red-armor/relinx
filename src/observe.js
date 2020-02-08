import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import context from './context'
import Tracker from './tracker'
import { generateObserveKey } from './utils/key'

let count = 0

const Helper = ({ addListener }) => {
  addListener()
  return null
}

export default (WrappedComponent) => {
  function NextComponent(props) {
    const [state, setState] = useState(0)
    const storeName = useRef()
    const trackerNode = useRef()
    const {
      application,
      useProxy,
      namespace,
      ...rest
    } = useContext(context)

    console.log('namespace ', namespace)

    const attachStoreName = useCallback(name => {
      storeName.current = name
      const initialState = application.getStoreData(storeName.current)

      trackerNode.current = Tracker({
        base: initialState,
        useProxy,
        useRevoke: false,
        useScope: true,
      })
    }, [])

    const addListener = useCallback(() => {
      const paths = trackerNode.current.tracker.getRemarkablePaths()
      console.log('paths ', storeName.current, paths)
    }, [])

    const getData = useCallback(() => ({ trackerNode: trackerNode.current }), [])

    const teardown = []

    const autoRunFn = useCallback(() => {
      setState(state + 1)
    }, [state])

    const contextValue = {
      ...rest,
      attachStoreName,
      getData,
    }

    return (
      <context.Provider value={contextValue}>
        <React.Fragment>
          <WrappedComponent {...props} />
          <Helper addListener={addListener} />
        </React.Fragment>
      </context.Provider>
    )
  }

  NextComponent.displayName = WrappedComponent.displayName
    || WrappedComponent.name
    || 'ObservedComponent'

  return NextComponent
}
