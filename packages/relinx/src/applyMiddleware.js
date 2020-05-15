import compose from "./utils/compose"

export default function applyMiddleware(...middleware) {
  const nextMiddleware = [...middleware]
  return createStore => (...args) => {
    const store = createStore(...args)
    const {reducers, effects, initialState} = store

    const api = {
      dispatch: (...args) => store.dispatch(...args),
      getState: () => initialState,
      reducers,
      effects
    }

    const chain = nextMiddleware.map(middleware => middleware(api))
    const createDispatch = setValue => {
      store.dispatch = compose(...chain)(setValue)
      return store.dispatch
    }

    return {
      ...store,
      createDispatch
    }
  }
}
