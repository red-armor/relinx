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

const diff = (componentName, patcher, proxy) => {
  const key1 = Object.keys(unmount)
  if (key1.indexOf(componentName) !== -1) {
    infoLog('invalid re-render', componentName, patcher, proxy)
  }
}

export default WrappedComponent => {
  function NextComponent(props) {
    const state = useRef(0)
    const shadowState = useRef(0)
    const [_, setState] = useState(state.current) // eslint-disable-line
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
        displayName: NextComponent.displayName,
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
    }), [])

    // onUpdate, `relink` relative paths value....
    if (trackerNode.current.proxy) {
      const proxy = trackerNode.current.proxy
      // 为什么如果进行remove的话，`propProperties`已经将旧key删除了呢。。。
      const propProperties = proxy.getProp('propProperties')

      propProperties.forEach(prop => {
        try {
          const { source } = prop
          const rootPath = source.getProp('rootPath')
          const storeName = rootPath[0]
          const currentBase = application.getStoreData(storeName)
          source.runFn('relinkBase', currentBase)
        } catch (err) {
          infoLog('[observe rebase propProperties]', err)
        }
      })

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application.getStoreData(storeName.current)
          proxy.runFn('rebase', base)
        }
      }

      trackerNode.current.proxy.runFn('cleanup')
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
      if (!trackerNode.current.proxy) return

      const paths = trackerNode.current.proxy.runFn('getRemarkableFullPaths')
      patcher.current.update({ paths })
      application.addPatcher(patcher.current)
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
