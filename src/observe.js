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
import infoLog from './utils/infoLog'

let count = 0

const Helper = ({ addListener }) => {
  addListener()
  return null
}

const DEBUG = true

export default (WrappedComponent) => {
  function NextComponent(props) {
    const state = useRef(0)
    const [_, setState] = useState(state.current)
    const storeName = useRef()
    const isHydrated = useRef(false)
    const isInit = useRef(true)
    // const occupied = useRef(false)

    const {
      application,
      useProxy,
      namespace,
      patcher: parentPatcher,
      trackerNode: parentTrackerNode,
      useRelinkMode,
      ...rest
    } = useContext(context)

    const incrementCount = useRef(count++)
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`
    const autoRunFn = () => {
      state.current = state.current + 1
      setState(state.current)
    }
    const patcher = useRef()
    const trackerNode = useRef()

    useEffect(() => {
      if (!DEBUG) return
      if (isInit.current) {
        infoLog('[Observe]', `${componentName} is inited`)
        isInit.current = false
      } else {
        infoLog('[Observe]', `${componentName} is re-rendered`)
      }
    })

    if (!patcher.current) {
      patcher.current = new Patcher({
        paths: [],
        autoRunFn,
        parent: parentPatcher,
        key: generatePatcherKey({ namespace, componentName }),
      })
    }

    if (!trackerNode.current) {
      // `base` should has a default value value `{}`, or it will cause error.
      // Detail refer to https://github.com/ryuever/relinx/issues/6
      trackerNode.current = Tracker({
        base: {},
        useProxy,
        useRevoke: false,
        useScope: true,
        parent: parentTrackerNode,
        rootPath: [],
      })
    }

    if (trackerNode.current) {
      trackerNode.current.enterContext()
    }

    // destroy `patcher` when component un-mount.
    useEffect(() => {
      return () => {
        patcher.current && patcher.current.destroy()
      }
    }, [])

    const getData = useCallback(() => ({
      trackerNode: trackerNode.current,
      // occupied: occupied.current,
    }), [])

    // onUpdate, `relink` relative paths value....
    if (trackerNode.current.tracker) {
      const tracker = trackerNode.current.tracker

      const {
        propertyFromProps = [],
        paths = []
      } = tracker.getInternalPropExported(['propertyFromProps', 'paths'])

      propertyFromProps.forEach(prop => {
        const { path, source } = prop
        const currentBase = application.getStoreData(source.rootPath[0])
        source.relink(path, currentBase)
      })

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application.getStoreData(storeName.current)
          paths.forEach(path => {
            tracker.relink(path, base)
          })
        }
      }

      trackerNode.current.tracker.cleanup()
    }

    // only run one time
    const attachStoreName = useCallback(name => {
      // occupied.current = true
      if (useRelinkMode) {
        if (name && !isHydrated.current) {
          storeName.current = name
          const initialState = application.getStoreData(storeName.current)
          trackerNode.current.hydrate(initialState, {
            rootPath: [storeName.current],
          })
          isHydrated.current = true
        }
      } else {
        storeName.current = name
        const initialState = application.getStoreData(storeName.current)
        trackerNode.current.hydrate(initialState, {
          rootPath: [storeName.current],
        })
        isHydrated.current = true
      }
    }, [])

    const addListener = useCallback(() => {
      const paths = trackerNode.current.tracker.getRemarkableFullPaths()
      patcher.current.update({ paths })
      application.addPatcher(patcher.current)
      trackerNode.current.leaveContext()
    }, [])

    const contextValue = {
      ...rest,
      getData,
      application,
      useProxy,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      trackerNode: trackerNode.current,
      attachStoreName,
      // occupied: occupied.current,
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

  return React.memo(props => <NextComponent {...props} />, () => true)
}
