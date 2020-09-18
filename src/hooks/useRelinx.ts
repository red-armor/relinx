import { useContext } from 'react';
import invariant from 'invariant';
import context from '../context';
import {
  RelinxState,
  RelinxDispatch,
  UseRelinxReturnValue,
  ContextDefaultValue,
} from '../types';

export default <T, M, K extends keyof T = any>(
  storeName: K
): UseRelinxReturnValue<T, M, K> => {
  const { dispatch, getData, attachStoreName } = useContext<
    ContextDefaultValue<T, M>
  >(context);

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required'
  );

  invariant(!!getData, `'useRelinx' should be wrapper in observe function`);

  attachStoreName(storeName);

  const { trackerNode } = getData();

  invariant(!!trackerNode!.proxy, `[useRelinx]: 'getData' fails`);

  return [
    (trackerNode!.proxy as unknown) as RelinxState<T, M, K>,
    dispatch as RelinxDispatch<T, M>,
  ];
};
