export default ({
  models,
}) => {
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

  return nextActions.reduce((acc, action) => {
    const { type, payload } = action
    const [key, actionType] = type.split('/')
    const usedReducer = reducers[key]

    if(!usedReducer) {
      throw new Error('Reducer missing for type `${type}`')
    }

    const changedValue = usedReducer[actionType](state[key], payload)

    acc.push({
      storeKey: key,
      changedValue,
    })

    return acc
  }, [])
}