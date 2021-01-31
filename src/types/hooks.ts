import { Dispatch, ExtractStateTypeOnlyModels } from './createStore';

export type RelinxState<T, K> = K extends keyof T
  ? ExtractStateTypeOnlyModels<T>[K]
  : any;
export type RelinxDispatch<T> = Dispatch<T>;
export type UseRelinxReturnValue<T, K> = [RelinxState<T, K>, RelinxDispatch<T>];
