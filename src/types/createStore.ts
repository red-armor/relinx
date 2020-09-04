import { Action } from './';

export type GenericState<T, K extends keyof T> = {
  [key in keyof K]: T[K];
};

export interface ChangedValueGroup {
  storeKey: string;
  changedValue: object;
}

export interface Model<
  S = any,
  SK extends keyof S = any,
  R = any,
  RK extends keyof R = any,
  E = any,
  EK extends keyof E = any
> {
  state: {
    [key in SK]: S[key];
  };
  reducers?: {
    [key in RK]: R[key];
  };
  effects?: {
    [key in EK]: E[key];
  };
}

export interface ReducerMapObject<S> {
  [key: string]: (currentState: S, payload?: object) => Partial<S>;
  // [key: string]: Reducer<S>;
}

export interface Reducer<S> {
  (currentState: S, payload?: object): Partial<S>;
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
  SS = any,
  // SSK extends keyof SS =any,
  S = any,
  SK extends keyof S = any,
  R = any,
  RK extends keyof R = any,
  E = any,
  EK extends keyof E = any
> {
  models: {
    // [key in keyof SS]: SS[key];
    [key in keyof SS]: Model<S, SK, R, RK, E, EK>;
  };
  initialValue?: {
    [key in keyof SS]: {
      [key: string]: any;
    };
  };
}

export interface State {
  [key: string]: object;
}

export interface Effect {
  [key: string]: Function;
}

export interface StateMap {
  [key: string]: State;
}

// export interface ReducerMap {
//   [key: string]: Reducer;
// }

export interface EffectMap {
  [key: string]: Effect;
}
