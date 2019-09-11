import React, {
  useMemo,
  useReducer,
  useEffect,
} from 'react'
import context from './context'
import createDeepProxy from './reactive-state/createDeepProxy'

export default ({ store, children }) => {
  const { initialState, createReducer, effects, reducers } = store

  const proxyState = useMemo(() => createDeepProxy(initialState), [])
  const combinedReducers = useMemo(() => createReducer(initialState), [])

  const [value, setValue] = useReducer(combinedReducers, [{
    storeKey: '',
    changedValue: {},
  }])

  const dispatch = useMemo(() => {
    const api = {
      dispatch: action => setValue(action),
      getState: () => initialState
    }

    const middleware = ({ dispatch, getState }) => action => {
      const { type, payload } = action
      const [storeKey, actionType] = type.split('/')

      if (reducers[storeKey] && reducers[storeKey][actionType]) {
        // 如果说是调用reducer中的方法的话，它的第一个参数`state`应该是`proxyState[storeKey]`
        dispatch(reducers[storeKey][actionType](initialState[storeKey], payload))
      } else if (effects[storeKey] && effects[storeKey][actionType]) {
        const next = nextAction => {
          const nextActionArr = [].concat(nextAction)
          dispatch(nextActionArr.reduce((acc, action) => {
            const { type } = action
            let nextType = type
            const parts = type.split('/')
            if (parts.length === 1) {
              nextType = `${storeKey}/${parts[0]}`
            }
            acc.push({
              ...action,
              type: nextType,
            })

            return acc
          }, []))
        }

        effects[storeKey][actionType](payload)(next, getState)
      } else {
        throw new Error('action `${type}` has no responding reducer')
      }
    }

    return middleware(api)
  }, [])

  useEffect(() => {
    value.forEach(currentValue => {
      const { storeKey, changedValue } = currentValue
      const keys = Object.keys(changedValue)
      keys.forEach(key => {
        proxyState[storeKey][key] = changedValue[key]
        initialState[storeKey][key] = changedValue[key]
      })
    })
  }, [value])

  const propagatedValue = useMemo(() => ({
    value: {
      initialState,
      subscriptions: proxyState.subscriptions,
    },
    dispatch,
  }), [])

  return (
    <context.Provider value={propagatedValue}>
      {children}
    </context.Provider>
  )
}