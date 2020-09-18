import { useContext } from 'react';
import context from '../context';
import { ContextDefaultValue } from '../types';

export default <T, M>() => {
  const { dispatch } = useContext<ContextDefaultValue<T, M>>(context);
  return [dispatch];
};
