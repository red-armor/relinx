import { useContext } from 'react';
import context from '../context';
import { ContextDefaultValue, RelinxDispatch } from '../types';

export default <T>(): [RelinxDispatch<T>] => {
  const { dispatch } = useContext<ContextDefaultValue<T>>(context);
  return [dispatch as RelinxDispatch<T>];
};
