export default ({
  getState,
  dispatch,
  reducers,
  effects,
}) => next => (actions, storeKey) => {
  if (typeof actions === 'function') {
    const nextDispatch = (...args) => {
      const nextArgs = [].concat(...args)
      const actions = nextArgs.map(action => {
        const { type, payload } = action
        const parts = [storeKey].concat(type.split('/')).slice(-2)
        const nextAction = {
          type: parts.join('/'),
        }
        if (payload) {
          nextAction.payload = payload
        }

        return nextAction
      })
      dispatch(actions)
    }
    return actions(nextDispatch, getState)
  }

  const nextActions = [].concat(actions)
  const reducerActions = []
  const effectActions = []

  nextActions.filter(action => {
    // filter object with `type`
    if (Object.prototype.toString.call(action) === '[object Object]') {
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

      const currentEffects = effects[storeKey]

      if (currentEffects && currentEffects[actionType]) {
        return effectActions.push(action)
      }

      // if (currentReducers[actionType]) {
        return reducerActions.push(action)
      // }
    } catch (info) {
      console.error(info)
      // info process action fails
    }
  })

  if (reducerActions.length) {
    next(reducerActions)
  }

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
