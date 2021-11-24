import compose from './utils/compose';
import {
  BasicModelType,
  CreateStoreFn,
  CreateStoreOnlyModels,
  Middleware,
  UnionActions,
} from './types';

export default function applyMiddleware(...middleware: Array<Middleware>) {
  // @ts-ignore
  const nextMiddleware = [...middleware];
  return <T extends BasicModelType<T>>(
    createStore: CreateStoreFn<T>
  ) => (config: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in keyof T]?: any;
    };
  }) => {
    const store = createStore(config);
    const initialState = store.getState();

    const api = {
      dispatch: (actions: UnionActions, ...rest: Array<any>) =>
        store.dispatch(actions, ...rest),
      getState: () => initialState,
      store,
    };

    const chain = nextMiddleware.map(middleware => middleware<T>(api));
    store.decorateDispatch(compose(...chain));

    return store;
  };
}
