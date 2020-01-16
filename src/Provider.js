import React, {
  useMemo,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import context from './context'
import central from './central'
import infoLog from './utils/infoLog'
import mergeAutoRunActions from './utils/mergeAutoRunActions'

const DEBUG = false

export default ({ store, children, namespace = 'default' }) => {
  const { initialState, createReducer, createDispatch } = store
  const nonReactiveInitialState = initialState
  const initialized = useRef({})

  if (!initialized.current[namespace]) {
    central.addApplication({
      initialState, namespace
    })
    initialized.current[namespace] = true
  }

  const combinedReducers = useMemo(() => createReducer(nonReactiveInitialState), [])
  const [value, setValue] = useReducer(combinedReducers, [{
    storeKey: '',
    changedValue: {},
  }])

  let setState = setValue

  if (DEBUG) {
    // 打印出来actions中的reducers方法；对于在effects中的actions都会单独再打印出来
    // 对于action是一个function的话，目前只能够通过`middleware`层进行hook；因为这个
    // dispatch其实只能是操作`reducer`
    setState = (...args) => {
      infoLog('Dispatch Action ', ...args)
      setValue(...args)
    }
  }

  const dispatch = useMemo(() => createDispatch(setState), [])

  useEffect(() => {
    try {
      let autoRunComputations = []
      value.forEach(currentValue => {
        const { storeKey, changedValue = {} } = currentValue
        const keys = Object.keys(changedValue)
        keys.forEach(key => {
          const newComputations = central.reconcileWithPaths(
            [storeKey, key],
            changedValue[key],
            namespace
          )
          autoRunComputations = autoRunComputations.concat(newComputations)
        })
      })

      // 触发autoRunFunction函数进行调用，从而进行数据层的更新
      const autoRunLeft = mergeAutoRunActions(autoRunComputations)
      autoRunLeft.forEach(comp => comp.applyChange())
    } catch (err) {
      console.error(err) // eslint-disable-line
    }
  }, [value])

  if (DEBUG) {
    infoLog('central : ', central)
  }

  // Context only need to pass `dispatch`, state value could get
  // from isolate `useTracker` instance
  const propagatedValue = useMemo(() => ({
    computation: null,
    namespace,
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}
