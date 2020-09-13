import React, { useRef, FC } from 'react';
import context, { defaultValue } from './context';
import Application from './Application';
import { generateNamespaceKey } from './utils/key';
import { BasicModelType } from './types';
import Store from './Store';

export default <T extends BasicModelType<T>, K extends keyof T>({
  store,
  children,
  namespace,
  useProxy = true,
  useRelinkMode = true,
  strictMode = false,
}: {
  store: Store<T, K>;
  children: FC<any>;
  namespace: string;
  useProxy: boolean;
  useRelinkMode: boolean;
  strictMode: boolean;
}) => {
  // const { initialState, createReducer, createDispatch } = store;
  const namespaceRef = useRef(namespace || generateNamespaceKey());
  const application = useRef(
    new Application<T, K>({
      base: store.getState() as any,
      namespace: namespaceRef.current,
      strictMode,
    })
  );

  store.bindApplication(application.current);
  const dispatch = store.dispatch;

  const contextValue = useRef({
    ...defaultValue,
    dispatch,
    useProxy,
    useRelinkMode,
    namespace: namespaceRef.current,
    application: application.current,
  });

  return (
    <context.Provider value={contextValue.current}>{children}</context.Provider>
  );
};
