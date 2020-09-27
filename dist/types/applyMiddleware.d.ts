import { CreateStoreFn, BasicModelType } from './createStore';
import { Action, GetState } from './createStore';
import Store from '../Store';
export declare type UnionActions = Action | Array<Action>;
export declare type Next = (actions: Array<Action>) => void;
export declare type ThunkDispatch<T> = (action: (dispatch: InternalDispatch, getState: GetState<T>) => void, storyKey: keyof T) => void;
export declare type InternalDispatch = (actions: UnionActions, ...rest: Array<any>) => void;
export declare type ApplyMiddlewareAPI<T extends BasicModelType<T>> = {
    getState: GetState<T>;
    store: Store<T>;
    dispatch?: InternalDispatch | ThunkDispatch<T>;
};
export declare type Middleware = <T extends BasicModelType<T>>(api: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action> | Function, storeKey: keyof T) => void;
export interface ApplyMiddleware {
    (...args: Array<Middleware>): EnhanceFunction;
}
export interface EnhanceFunction {
    <EnhanceFunctionProps extends BasicModelType<EnhanceFunctionProps>, K extends keyof EnhanceFunctionProps>(createStore: CreateStoreFn<EnhanceFunctionProps, K>): any;
}
