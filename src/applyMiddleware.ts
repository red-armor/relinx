import compose from './utils/compose';
import {
  BasicModelType,
  CreateStoreFn,
  CreateStoreOnlyModels,
  Middleware,
  Dispatch,
  UnionActions,
} from './types';

export default function applyMiddleware(...middleware: Array<Middleware>) {
  const nextMiddleware = [...middleware];
  return <T extends BasicModelType<T>>(
    createStore: CreateStoreFn<T>
  ) => (config: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in keyof T]?: any;
    };
  }) => {
    const store = {
      ...createStore(config),
      dispatch: (undefined as unknown) as Dispatch,
    };
    const { reducers, effects, initialState } = store;

    const api = {
      dispatch: (actions: UnionActions, ...rest: Array<any>) =>
        store.dispatch(actions, ...rest),
      getState: () => initialState,
      reducers,
      effects,
    };

    const chain = nextMiddleware.map(middleware => middleware<T>(api));
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
