import { GetStoreState } from './';

export interface Action {
  type: string;
  payload?: object;
}

export type Dispatch = (action: Action | Array<Action>) => void;

export type ModelEffect = (
  payload: any
) => (dispatch: Dispatch, getState: GetStoreState) => void;
export type ModelReducer<S> = (state: S, payload?: any) => Partial<S>;

export interface ModelState<
  S extends {
    [key: string]: any;
  }
> {
  state: S;
  reducers?: {
    [key in string]: ModelReducer<S>;
  };
  effects?: {
    [key in string]: ModelEffect;
  };
}
