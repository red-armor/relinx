export interface Action {
  type: string;
  payload?: object;
}

export type GenericState<T, K extends keyof T> = {
  [key in keyof K]: T[K];
};

export interface ChangedValueGroup {
  storeKey: string;
  changedValue: object;
}

export interface Model<
  T,
  R,
  E,
  K extends keyof T,
  M extends keyof R,
  N extends keyof E
> {
  state: T[K];
  reducers: R[M];
  // reducers: RR<R, M>;
  effects: E[N];
}

export type RR<R, M extends keyof R> = {
  [key in M]: {
    [k: string]: (
      state: {
        [stateKey: string]: any;
      },
      payload?: any
    ) => any;
  };
};

export type SS<T, K extends keyof T> = {
  [key in K]: {
    [k: string]: any;
  };
};

export interface CombineReducers {
  <R, M extends keyof R>(reducers: RR<R, M>): CombineReducersReducer1;
}

export interface CombineReducersReducer1 {
  <T, K extends keyof T>(state: SS<T, K>): CombineReducersReducer2;
}

export interface CombineReducersReducer2 {
  (_: any, actions: Array<Action>): Array<any>;
}

export interface Configs<
  T,
  R,
  E,
  K extends keyof T,
  M extends keyof R,
  N extends keyof E
> {
  models: {
    [key in K & M & N]: Model<T, R, E, K, M, N>;
  };
  initialValue?: {
    [key in K]: object;
  };
}

export interface State {
  [key: string]: object;
}

export interface Effect {
  [key: string]: Function;
}

export interface Reducer {
  [key: string]: (currentState: object, payload?: object) => object;
}

export interface StateMap {
  [key: string]: State;
}

export interface ReducerMap {
  [key: string]: Reducer;
}

export interface EffectMap {
  [key: string]: Effect;
}
