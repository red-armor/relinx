import { FC } from 'react';
import { CombineReducersReducer1 } from './types';
declare const _default: <T, K extends keyof T>({ store, children, namespace, useProxy, useRelinkMode, strictMode, }: {
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
}) => JSX.Element;
export default _default;
