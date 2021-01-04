import { useContext } from 'react';
import { StateTrackerUtil } from 'state-tracker';
import context from '../context';
import {
  RelinxState,
  RelinxDispatch,
  UseRelinxReturnValue,
  ContextDefaultValue,
} from '../types';

export default <T, M, K extends keyof T = any>(
  storeName?: K
): UseRelinxReturnValue<T, M, K> => {
  const { dispatch, application, $_modelKey } = useContext<
    ContextDefaultValue<T, M>
  >(context);
  const store = application!.store;

  const nextStoreName = store.getModelKey((storeName || $_modelKey) as string);
  const proxyState = application?.proxyState;
  const state = StateTrackerUtil.peek(proxyState!, [nextStoreName as string]);

  return [
    (state as any) as RelinxState<T, M, K>,
    dispatch as RelinxDispatch<T, M>,
  ];
};
