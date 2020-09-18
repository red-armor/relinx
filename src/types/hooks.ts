import { Dispatch, ExtractStateTypeOnlyModels } from './createStore';

export type RelinxState<T, M, K> = M extends string
  ? M extends keyof T
    ? ExtractStateTypeOnlyModels<T>[M]
    : any
  : K extends keyof T
  ? ExtractStateTypeOnlyModels<T>[K]
  : any;
export type RelinxDispatch<T, M> = M extends string
  ? Dispatch<T, {}>
  : Dispatch<T, M>;
export type UseRelinxReturnValue<T, M, K> = [
  RelinxState<T, M, K>,
  RelinxDispatch<T, M>
];
