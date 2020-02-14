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

const DEBUG = false

const unmount = {}
const rerender = {}

const diff = (componentName, patcher, tracker) => {
  const key1 = Object.keys(unmount)
  if (key1.indexOf(componentName) !== -1) {
    infoLog('invalid re-render', componentName, patcher, tracker)
  }
}

export default WrappedComponent => {
  function NextComponent(props) {
    const state = useRef(0)
    const shadowState = useRef(0)
    const [_, setState] = useState(state.current)
    const storeName = useRef()
    const isHydrated = useRef(false)
    const isInit = useRef(true)
    const patcherUpdated = useRef(0)

    const {
      application,
      useProxy,
      namespace,
      patcher: parentPatcher,
      trackerNode: parentTrackerNode,
      useRelinkMode,
      ...rest
    } = useContext(context)

    const incrementCount = useRef(count++)  // eslint-disable-line
    const componentName = `${NextComponent.displayName}-${incrementCount.current}`
    const patcher = useRef()
    const trackerNode = useRef()

    shadowState.current += 1

    const autoRunFn = () => {
      state.current += 1
      setState(state.current)
      rerender[componentName] = patcher.current
      diff(componentName, patcher.current, trackerNode.current)
    }

    useEffect(() => {
      if (!DEBUG) return
      if (isInit.current) {
        infoLog('[Observe]', `${componentName} is init`)
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
    useEffect(() => () => {
      if (patcher.current) patcher.current.destroyPatcher()
      unmount[componentName] = patcher.current
    }, [])

    const getData = useCallback(() => ({
      trackerNode: trackerNode.current,
      // occupied: occupied.current,
    }), [])

    // onUpdate, `relink` relative paths value....
    if (trackerNode.current.tracker) {
      const tracker = trackerNode.current.tracker

      // 为什么如果进行remove的话，`propertyFromProps`已经将旧key删除了呢。。。
      const {
        propertyFromProps = [],
        paths = [],
        base: prevBase,
      } = tracker.getInternalPropExported(['propertyFromProps', 'paths', 'base'])

      propertyFromProps.forEach(prop => {
        const { source } = prop
        const storeName = source.rootPath[0]
        const currentBase = application.getStoreData(storeName)

        source.rebase(currentBase)
      })

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application.getStoreData(storeName.current)
          tracker.rebase(base)
        }
      }

      trackerNode.current.tracker.cleanup()
    }

    // only run one time
    const attachStoreName = useCallback(name => {
      // patcher.current.teardown()
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
      patcher.current.appendTo(parentPatcher) // maybe not needs
      const paths = trackerNode.current.tracker.getRemarkableFullPaths()
      // console.log('tear down ', componentName)
      patcher.current.update({ paths })
      application.addPatcher(patcher.current)
      // console.log('paths ', paths)
      patcherUpdated.current += 1
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

  return NextComponent
  // return React.memo(props => <NextComponent {...props} />, () => true)
}
