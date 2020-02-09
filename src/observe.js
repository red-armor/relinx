import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import context from './context'
import Tracker from './tracker'
import { generatePatcherKey } from './utils/key'
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
      patcher: parentPatcher,
      getData: parentGetData,
      ...rest
    } = useContext(context)

    const incrementCount = useRef(count++)
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`
    const autoRunFn = () => {
      state.current = state.current + 1
      setState(state.current)
    }
    const patcher = useRef(new Patcher({
      paths: [],
      autoRunFn,
      parent: parentPatcher,
      key: generatePatcherKey({ namespace, componentName }),
    }))
    const getData = useCallback(() => ({ trackerNode: trackerNode.current }), [])

    // should relink first
    const propertyFromProps =
      trackerNode.current
      ? trackerNode.current.tracker.propertyFromProps
      : []

    if (propertyFromProps.length) {
      const currentBase = application.getStoreData(storeName.current)
      propertyFromProps.forEach(prop => {
        const { path, source } = prop
        source.relink(path, currentBase)
      })
    }

    // only run one time
    const attachStoreName = useCallback(name => {
      storeName.current = name
      const initialState = application.getStoreData(storeName.current)
      const parent = parentGetData ? parentGetData().trackerNode : null

      // It is difficult to clean up tracker object, so recreate
      // should be a better choice...
      // As a result, `useRelinx` should have self `observe` function.
      trackerNode.current = Tracker({
        base: initialState,
        useProxy,
        useRevoke: false,
        useScope: true,
        parent,
      })
    }, [])

    const addListener = useCallback(() => {
      const paths = trackerNode.current.tracker.getRemarkablePaths()

      patcher.current.update({
        paths,
        storeName: storeName.current,
      })

      application.addPatcher(patcher.current)
    }, [])

    const contextValue = {
      ...rest,
      getData,
      application,
      useProxy,
      namespace,
      patcher: patcher.current,
      trackerNode: trackerNode.current,
      attachStoreName,
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
