import { UnionActions } from './applyMiddleware';
import { GetState } from './createStore';
export declare type ThunkFn<T> = (payload: any) => (dispatch: (actions: UnionActions) => void, getState: GetState<T>) => void;
