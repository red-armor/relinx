import { useContext } from 'react';
import { StateTrackerUtil } from 'state-tracker';
import context from '../context';
import {
  RelinxState,
  RelinxDispatch,
  UseRelinxReturnValue,
  ContextDefaultValue,
} from '../types';

export default <T, K extends keyof T = any>(
  storeName?: K
): UseRelinxReturnValue<T, K> => {
  const { dispatch, application, $_modelKey } = useContext<
    ContextDefaultValue<T>
  >(context);
  const store = application!.store;

  const nextStoreName = store.getModelKey((storeName || $_modelKey) as string);
  const proxyState = application?.proxyState;
  const state = StateTrackerUtil.peek(proxyState!, [nextStoreName as string]);

  return [(state as any) as RelinxState<T, K>, dispatch as RelinxDispatch<T>];
};
