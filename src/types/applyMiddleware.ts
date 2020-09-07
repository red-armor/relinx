import { CreateStoreFn, BasicModelType } from './createStore';
import {
  Action,
  ExtractStateTypeOnlyModels,
  ExtractReducersTypeOnlyModels,
  ExtractEffectsTypeOnlyModels,
} from './createStore';

export type GetState<T> = () => ExtractStateTypeOnlyModels<T>;
export type UnionActions = Action | Array<Action>;

export type Next = (actions: Array<Action>) => void;
export type ThunkDispatch<T> = (
  action: (dispatch: Dispatch, getState: GetState<T>) => void,
  storyKey: keyof T
) => void;

// ...rest should be preserved, or dispatch an function will not has `storeKey`
export type Dispatch = (actions: UnionActions, ...rest: Array<any>) => void;

export type ApplyMiddlewareAPI<T> = {
  getState: GetState<T>;
  reducers: ExtractReducersTypeOnlyModels<T>;
  effects: ExtractEffectsTypeOnlyModels<T>;

  // TODO: ts reconsider, why it not work...
  dispatch?: Dispatch | ThunkDispatch<T>;
  // dispatch?: {
  //   (actions: UnionActions): void,
  //   (
  //     action: (dispatch: Dispatch<T>, getState: GetState<T>) => void,
  //     storyKey: keyof T
  //   ): void,
  // }
};

export type Middleware = <T>(
  api: ApplyMiddlewareAPI<T>
) => (
  next: Next
) => (actions: Array<Action> | Function, storeKey: keyof T) => void;

export interface ApplyMiddleware {
  (...args: Array<Middleware>): EnhanceFunction;
}

export interface EnhanceFunction {
  <
    EnhanceFunctionProps extends BasicModelType<EnhanceFunctionProps>,
    K extends keyof EnhanceFunctionProps
  >(
    createStore: CreateStoreFn<EnhanceFunctionProps, K>
  ): any;
}
