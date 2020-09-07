import { GetState, UnionActions } from './applyMiddleware';
export declare type ThunkFn<T> = (payload: any) => (dispatch: (actions: UnionActions) => void, getState: GetState<T>) => void;
