import invariant from 'invariant'

const ANONYMOUS = 'anonymous-group'

const getNode = (tree, paths = []) => {
  if (!paths.length) return tree
  const [actionType, type] = paths.shift().split('\.')
  const nextTree = tree[actionType][type]
  return getNode(nextTree, paths)
}

const decorateToken = (props, base = {}) => {
  base.actions = {}
  base.effects = {}

  const reservedKey = ['type', 'actionType', 'payload']

  reservedKey.forEach(key => {
    if (typeof props[key] !== 'undefined') {
      base[key] = props[key]
    }
  })

  return base
}

export default config => ({
  getState,
  dispatch,
  reducers,
  effects,
}) => next => (actions, extra = {}) => {
  let nextActions = actions
  if (!Array.isArray(actions)) {
    nextActions = [nextActions]
  }

  const {
    extraSupported,
  } = config || {}

  let tree = extra.tree
  const parentStub = extra.parentStub || []
  let parentNode
  let isRoot = false
  let hasAnonymousRoot = false

  if (extraSupported) {
    if (!extra.tree) {
      isRoot = true
      if (nextActions.length > 1) {
        hasAnonymousRoot = true
        parentNode = extra.tree = decorateToken({
          type: ANONYMOUS,
          actionType: 'action',
        })
      } else {
        parentNode = extra.tree = {}
      }
    } else {
      parentNode = getNode(tree, parentStub)
    }
  }

  const resolveEffectParentStub = type => {
    if (isRoot && !hasAnonymousRoot) {
      return []
    }

    return parentStub.length ? [...parentStub, `effects.${type}`] : [`effects.${type}`]
  }

  const actionGroup = []

  nextActions.forEach(action => {
    const { type, payload } = action
    const [storeKey, actionType] = type.split('/')
    const currentReducers = reducers[storeKey] || {}
    const currentActionReducersHandler = currentReducers[actionType]

    if (currentActionReducersHandler) {
      actionGroup.push(action)
      if (extraSupported) {
        if (!parentNode.actions) {
          parentNode = decorateToken({
            type,
            payload,
            actionType: 'action'
          }, parentNode)
        } else {
          parentNode.actions[type] = decorateToken({
            type,
            payload,
            actionType: 'action',
          })
        }
      }
    }

    const currentEffects = effects[storeKey] || {}
    const currentActionEffectsHandler = currentEffects[actionType]

    if (currentActionEffectsHandler) {
      if (extraSupported) {
        if (!parentNode.effects) {
          parentNode = decorateToken({
            type,
            payload,
            actionType: 'effect'
          }, parentNode)
        } else {
          parentNode.effects[type] = decorateToken({
            type,
            payload,
            actionType: 'effect',
          })
        }
      }

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

        if (extraSupported) {
          extra.parentStub = resolveEffectParentStub(type)
          dispatch(effectsActionGroup, extra)
        } else {
          dispatch(effectsActionGroup)
        }
      }

      // 当`effects`和`reducer`共同存在时，如果说`effects`中dispatch的是一个同步的`action`
      // 这个时候同样会出现`intermediate value`被覆盖的情况；所以在这里统一处理，将它放入下一个
      // event loop
      currentActionEffectsHandler(payload)((...args)=> {
        Promise.resolve().then(() => nextDispatch(...args), 0)
      }, getState)
    }
  })

  if (actionGroup.length) {
    next(actionGroup)
  }
  return actionGroup
}