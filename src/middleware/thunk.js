import invariant from 'invariant'

export default ({ getState, dispatch, reducers, effects}) => next => actions => {
  let nextActions = actions
  if (!Array.isArray(actions)) {
    nextActions = [nextActions]
  }

  const actionGroup = []

  nextActions.forEach(action => {
    const { type, payload } = action
    const [storeKey, actionType] = type.split('/')
    const currentReducers = reducers[storeKey] || {}
    const currentActionReducersHandler = currentReducers[actionType]

    if (currentActionReducersHandler) {
      actionGroup.push(action)
    }

    const currentEffects = effects[storeKey] || {}
    const currentActionEffectsHandler = currentEffects[actionType]

    if (currentActionEffectsHandler) {
      invariant(
        !actionGroup.length,
        'Effect action `${action}` should not be mixed with reducer actions'
      )

      const nextDispatch = action => {
        const effectsActionGroup = []

        const nextActions = [].concat(action)

        nextActions.forEach(action => {
          let { type: nextType } = action
          const parts = nextType.split('/')
          if (parts.length === 1) {
            nextType = `${storeKey}/${parts[0]}`
          }
          effectsActionGroup.push({
            ...action,
            type: nextType,
          })
        })
        dispatch(effectsActionGroup)
      }

      currentActionEffectsHandler(payload)(nextDispatch, getState)
    }
  })

  if (actionGroup.length) {
    next(actionGroup)
  }
  return actionGroup
}