import { useContext } from 'react';
import context from '../context';

export default (): string => {
  const { namespace } = useContext(context);
  return namespace!;
};
