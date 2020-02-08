import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import context from './context'
import Tracker from './tracker'
import { generateObserveKey, generatePatcherKey } from './utils/key'
import Patcher from './Patcher'

let count = 0

const Helper = ({ addListener }) => {
  addListener()
  return null
}

export default (WrappedComponent) => {
  function NextComponent(props) {
    const state = useRef(0)
    const [_, setState] = useState(state.current)
    const storeName = useRef()
    const trackerNode = useRef()
    const {
      application,
      useProxy,
      namespace,
      ...rest
    } = useContext(context)
    const incrementCount = useRef(count++)
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`
    const patcher = useRef()
    const getData = useCallback(() => ({ trackerNode: trackerNode.current }), [])
    const autoRunFn = () => {
      state.current = state.current + 1
      setState(state.current)
    }

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
      patcher.current = new Patcher({
        key: generatePatcherKey({
          namespace,
          componentName,
        }),
        paths,
        autoRunFn,
        storeName: storeName.current,
      })
      application.addPatcher(patcher.current)
    }, [])

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
