import React, { useContext } from 'react';
import context from './context';
import { ContextDefaultValue } from './types';

export type IReactComponent<P = any> =
  | React.ClassicComponentClass<P>
  | React.ComponentClass<P>
  | React.FunctionComponent<P>
  | React.ForwardRefExoticComponent<P>;

export type IWrappedComponent<P> = {
  wrappedComponent: IReactComponent<P>;
};

const useCreateInjectStoreComponent = <T, M>({
  storeName,
  componentClass,
}: {
  storeName: string;
  componentClass: IReactComponent<any>;
}) => {
  const { application, $_modelKey, componentName } = useContext<
    ContextDefaultValue<T, M>
  >(context);
  const proxyState = application?.proxyState;
  const nextStoreName = storeName || $_modelKey;

  const state = proxyState!.peek([nextStoreName as string]);
  const tracker = state.getTracker();
  tracker.setContext(componentName!);

  return React.createElement(componentClass);
};

export function inject(
  storeName: string
): <T extends IReactComponent<any>>(
  target: T
) => T & (T extends IReactComponent<infer P> ? IWrappedComponent<P> : never);

export function inject(storeName: string) {
  return (componentClass: React.ComponentClass<any, any>) => {
    return useCreateInjectStoreComponent({
      storeName,
      componentClass,
    });
  };
}
