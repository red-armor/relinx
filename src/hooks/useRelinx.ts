import { useContext } from 'react';
import invariant from 'invariant';
import context from '../context';
import { UseRelinxReturnValue } from '../types';

export default (storeName: string): UseRelinxReturnValue => {
  const { dispatch, getData, attachStoreName } = useContext(context);

  invariant(
    typeof storeName === 'string' && storeName !== '',
    '`storeName` is required'
  );

  invariant(!!getData, `'useRelinx' should be wrapper in observe function`);

  attachStoreName(storeName);

  const { trackerNode } = getData();

  invariant(!!trackerNode.proxy, `[useRelinx]: 'getData' fails`);

  return [trackerNode.proxy, dispatch];
};
