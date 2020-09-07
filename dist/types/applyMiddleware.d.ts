import { CreateStoreFn, BasicModelType } from './createStore';
import { Action, ExtractStateTypeOnlyModels, ExtractReducersTypeOnlyModels, ExtractEffectsTypeOnlyModels } from './createStore';
export declare type GetState<T> = () => ExtractStateTypeOnlyModels<T>;
export declare type UnionActions = Action | Array<Action>;
export declare type Next = (actions: Array<Action>) => void;
export declare type ThunkDispatch<T> = (action: (dispatch: Dispatch, getState: GetState<T>) => void, storyKey: keyof T) => void;
export declare type Dispatch = (actions: UnionActions, ...rest: Array<any>) => void;
export declare type ApplyMiddlewareAPI<T> = {
    getState: GetState<T>;
    reducers: ExtractReducersTypeOnlyModels<T>;
    effects: ExtractEffectsTypeOnlyModels<T>;
    dispatch?: Dispatch | ThunkDispatch<T>;
};
export declare type Middleware = <T>(api: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action> | Function, storeKey: keyof T) => void;
export interface ApplyMiddleware {
    (...args: Array<Middleware>): EnhanceFunction;
}
export interface EnhanceFunction {
    <EnhanceFunctionProps extends BasicModelType<EnhanceFunctionProps>, K extends keyof EnhanceFunctionProps>(createStore: CreateStoreFn<EnhanceFunctionProps, K>): any;
}
