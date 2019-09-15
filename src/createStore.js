import invariant from 'invariant'

export default function createStore(configs, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(configs)
  }

  const { models } = configs
  const keys = Object.keys(models)
  const globalState = {}
  const globalReducers = {}
  const globalEffects = {}

  keys.forEach(key => {
    const { state, reducers, effects } = models[key]
    globalState[key] = state
    globalReducers[key] = reducers
    globalEffects[key] = effects
  })

  return {
    initialState: globalState,
    createReducer: combineReducers(globalReducers),
    effects: globalEffects,
    reducers: globalReducers,
  }
}

const combineReducers = reducers => state => (_, actions) => {
  const nextActions = [].concat(actions)

  const changedValues = nextActions.reduce((changedValueGroup, action) => {
    const { type, payload } = action
    const [storeKey, actionType] = type.split('/')
    const usedReducer = reducers[storeKey]

    invariant(usedReducer, 'Reducer missing for type `${type}`')

    const currentState = state[storeKey]
    const changedValue = usedReducer[actionType](currentState, payload)

    changedValueGroup.push({
      storeKey: storeKey,
      changedValue,
    })

    return changedValueGroup
  }, [])

  // 为了在next(action)执行以后，数据源发生变化，所以将store的更新放置到这个地方；
  // 而响应式的`proxyState`则是在Provider进行同步更新
  changedValues.forEach(currentValue => {
    const { storeKey, changedValue } = currentValue
    const keys = Object.keys(changedValue)
    keys.forEach(key => {
      state[storeKey][key] = changedValue[key]
    })
  })
  return changedValues
}