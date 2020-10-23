import React, { useRef } from 'react';
import observe from './observe';
import useDispatch from './hooks/useDispatch';
import useRelinx from './hooks/useRelinx';
import { RelinxDispatch, RelinxState } from './types';
// import context from './context';
// import { ContextDefaultValue } from './types';

export type IReactComponent<P = any> =
  | React.ClassicComponentClass<P>
  | React.ComponentClass<P>
  | React.FunctionComponent<P>
  | React.ForwardRefExoticComponent<P>;

export type IWrappedComponent<P> = {
  wrappedComponent: IReactComponent<P>;
};

// const useCreateInjectStoreComponent = <T, M>({
//   storeName,
//   componentClass,
// }: {
//   storeName: string;
//   componentClass: IReactComponent<any>;
// }) => {
//   const { application, $_modelKey, componentName } = useContext<
//     ContextDefaultValue<T, M>
//   >(context);
//   const proxyState = application?.proxyState;
//   const nextStoreName = storeName || $_modelKey;

//   const state = proxyState!.peek([nextStoreName as string]);
//   const tracker = state.getTracker();
//   tracker.setContext(componentName!);

//   return React.createElement(componentClass);
// };

// export function inject(
//   storeName: string
// ): <T extends IReactComponent<any>>(
//   target: T
// ) => T & (T extends IReactComponent<infer P> ? IWrappedComponent<P> : never);

export default function inject<T, M, K extends keyof T = any>(
  storeName?: string
) {
  return (componentClass: React.ComponentClass<any, any>) => {
    let Injected;

    if (storeName && storeName.trim()) {
      Injected = (props: any) => {
        const dispatchRef = useRef<RelinxDispatch<T, M>>();
        const stateRef = useRef<RelinxState<T, M, K>>();

        const parts = useRelinx<T, M>(storeName as any);
        stateRef.current = parts[0];
        dispatchRef.current = parts[1];

        const nextProps = {
          ...props,
        };

        if (dispatchRef.current) nextProps.dispatch = dispatchRef.current;
        if (stateRef.current) nextProps.state = stateRef.current;

        return React.createElement(componentClass, nextProps);
      };
    } else {
      Injected = (props: any) => {
        const dispatchRef = useRef<RelinxDispatch<T, M>>();
        const parts = useDispatch<T, M>();
        dispatchRef.current = parts[0];

        const nextProps = {
          ...props,
        };

        if (dispatchRef.current) nextProps.dispatch = dispatchRef.current;

        return React.createElement(componentClass, nextProps);
      };
    }

    return observe(Injected);
  };
}
