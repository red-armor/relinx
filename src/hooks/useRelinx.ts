import { useContext } from 'react';
import invariant from 'invariant';
import context from '../context';
import { UseRelinxReturnValue, ContextDefaultValue } from '../types';

export default <T>(storeName: string): UseRelinxReturnValue<T> => {
  const { dispatch, getData, attachStoreName } = useContext<
    ContextDefaultValue<T>
  >(context);

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required'
  );

  invariant(!!getData, `'useRelinx' should be wrapper in observe function`);

  attachStoreName(storeName);

  const { trackerNode } = getData();

  invariant(!!trackerNode!.proxy, `[useRelinx]: 'getData' fails`);

  return [trackerNode!.proxy, dispatch];
};
