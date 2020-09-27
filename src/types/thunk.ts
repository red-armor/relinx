import { UnionActions } from './applyMiddleware';
import { GetState } from './createStore';

export type ThunkFn<T> = (
  payload: any
) => (dispatch: (actions: UnionActions) => void, getState: GetState<T>) => void;
