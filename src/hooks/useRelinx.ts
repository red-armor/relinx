import { useContext } from 'react';
import context from '../context';
import {
  RelinxDispatch,
  UseRelinxReturnValue,
  ContextDefaultValue,
} from '../types';

export default <T, M, K extends keyof T = any>(
  storeName: K
): UseRelinxReturnValue<T, M, K> => {
  const { dispatch, application, componentName } = useContext<
    ContextDefaultValue<T, M>
  >(context);

  const proxyState = application?.proxyState;
  const state = proxyState.peek([storeName]);
  const tracker = state.getTracker();
  tracker.setContext(componentName);

  return [state, dispatch as RelinxDispatch<T, M>];
};
