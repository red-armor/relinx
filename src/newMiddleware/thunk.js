export default ({
  getState,
  dispatch,
  reducers,
  effects,
}) => next => (actions, storeKey) => {
  if (typeof actions === 'function') {
    const nextDispatch = (...args) => {
      const action = args[0]
      const { type, payload } = action
      const parts = [storeKey].concat(type.split('/')).slice(1)
      dispatch({
        type: parts.join('/')
        payload,
      })
    }
    return actions(getState, nextDispatch)
  }

  const nextActions = [].concat(actions)
  const reducerActions = []
  const effectActions = []

  nextActions.filter(action => {
    // filter object with `type`
    if (Object.prototype.toString.call(action) === [object Object]) {
      const { type } = action
      return !!type
    }
  }).forEach(action => {
    try {
      const { type, payload } = action
      const parts = type.split('/')
      const storeKey = parts[0]
      const actionType = parts[1]
      const currentReducers = reducers[storeKey] || {}

      if (currentReducers[actionType]) {
        return reducerActions.push(action)
      }

      const currentEffects = effects[storeKey]
      if (currentReducers[actionType]) {
        return effectActions.push(action)
      }
    } catch (info) {
      // info process action fails
    }
  })

  next(reducerActions)

  effectActions.forEach(action => {
    const { type, payload } = action
    const parts = type.split('/')
    const storeKey = parts[0]
    const actionType = parts[1]
    const currentEffects = effects[storeKey]
    const handler = currentEffects[actionType]

    Promise.resolve().then(() => dispatch(handler(payload), storeKey))
  })
}
