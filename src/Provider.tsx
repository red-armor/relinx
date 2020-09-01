import React, { useMemo, useRef, useReducer, FC } from 'react';
import context, { defaultValue } from './context';
import Application from './Application';
import { generateNamespaceKey } from './utils/key';
import { CombineReducersReducer1 } from './types';

export default <T, K extends keyof T>({
  store,
  children,
  namespace,
  useProxy = true,
  useRelinkMode = true,
  strictMode = false,
}: {
  store: {
    initialState: T;
    createReducer: CombineReducersReducer1;
    createDispatch: Function;
  };
  children: FC<any>;
  namespace: string;
  useProxy: boolean;
  useRelinkMode: boolean;
  strictMode: boolean;
}) => {
  const { initialState, createReducer, createDispatch } = store;
  const namespaceRef = useRef(namespace || generateNamespaceKey());
  const application = useRef(
    new Application<T, K>({
      base: initialState as any,
      namespace: namespaceRef.current,
      strictMode,
    })
  );

  const combinedReducers = useMemo(() => createReducer(initialState), []);
  // no need to update value every time.
  const [value, setValue] = useReducer(combinedReducers, []);
  const setState = setValue;
  const dispatch = useMemo(() => createDispatch(setState), []);

  application.current.update(value);

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
