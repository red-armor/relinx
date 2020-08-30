import compose from './utils/compose';

export default function applyMiddleware(...middleware: Array<Function>) {
  const nextMiddleware = [...middleware];
  return (createStore: Function) => (...args: Array<any>) => {
    const store = createStore(...args);
    const { reducers, effects, initialState } = store;

    const api = {
      dispatch: (...args: Array<any>) => store.dispatch(...args),
      getState: () => initialState,
      reducers,
      effects,
    };

    const chain = nextMiddleware.map(middleware => middleware(api));
    const createDispatch = (setValue: Function) => {
      store.dispatch = compose(...chain)(setValue);
      return store.dispatch;
    };

    return {
      ...store,
      createDispatch,
    };
  };
}
