import React, { useRef } from 'react';
import context, { defaultValue } from './context';
import Application from './Application';
import { generateNamespaceKey } from './utils/key';
import { ProviderProps, BasicModelType } from './types';

// https://fettblog.eu/typescript-react/children/
// https://stackoverflow.com/questions/53958028/how-to-use-generics-in-props-in-react-in-a-functional-component
function Provider<T extends BasicModelType<T>, K extends keyof T = keyof T>({
  store,
  children,
  namespace,
  useProxy = true,
  useRelinkMode = true,
  strictMode = false,
  useScope = true,
}: ProviderProps<T>) {
  const namespaceRef = useRef(namespace || generateNamespaceKey());
  const application = useRef<Application<T, K>>();
  if (!application.current) {
    application.current = new Application<T, K>({
      store,
      namespace: namespaceRef.current,
      strictMode,
    });
  }

  store.bindApplication(application.current);
  const dispatch = store.dispatch;

  const contextValue = useRef({
    ...defaultValue,
    dispatch,
    useProxy,
    useScope,
    useRelinkMode,
    namespace: namespaceRef.current,
    application: application.current,
  });

  return (
    <context.Provider value={contextValue.current}>{children}</context.Provider>
  );
}

export default Provider;
