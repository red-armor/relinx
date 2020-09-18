import { useContext } from 'react';
import context from '../context';
import { ContextDefaultValue, RelinxDispatch } from '../types';

export default <T, M>(): [RelinxDispatch<T, M>] => {
  const { dispatch } = useContext<ContextDefaultValue<T, M>>(context);
  return [dispatch as RelinxDispatch<T, M>];
};
