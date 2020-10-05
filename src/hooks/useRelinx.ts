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
  const { dispatch, application } = useContext<
    ContextDefaultValue<T, M>
  >(context);

  const proxyState = application?.proxyState

  return [
    proxyState[storeName],
    dispatch as RelinxDispatch<T, M>,
  ]
};
