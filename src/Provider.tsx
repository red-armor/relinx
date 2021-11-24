import React, { useRef } from 'react';
import context, { defaultValue } from './context';
import { generateNamespaceKey } from './utils/key';
import { ProviderProps, BasicModelType } from './types';

// https://fettblog.eu/typescript-react/children/
// https://stackoverflow.com/questions/53958028/how-to-use-generics-in-props-in-react-in-a-functional-component
function Provider<T extends BasicModelType<T>>({
  store,
  children,
  namespace,
  shouldLogRerender,
  shouldLogActivity,
  shouldLogChangedValue,
}: ProviderProps<T>) {
  const namespaceRef = useRef(namespace || generateNamespaceKey());
  const initialRef = useRef(true);

  if (initialRef.current) {
    initialRef.current = false;
    store.updateLogConfig({
      shouldLogActivity,
      shouldLogRerender,
      shouldLogChangedValue,
    });
  }

  const dispatch = store.dispatch;

  const contextValue = useRef({
    ...defaultValue,
    dispatch,
    store,
    shouldLogActivity,
    shouldLogRerender,
    shouldLogChangedValue,
    namespace: namespaceRef.current,
  });

  return (
    <context.Provider value={contextValue.current}>{children}</context.Provider>
  );
}

export default Provider;
