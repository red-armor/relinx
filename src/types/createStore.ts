export interface Action {
  type: string;
  payload?: object;
}

export type ModelKey = 'state' | 'reducers' | 'effects';

export type BasicModelType<T> = {
  [key in keyof T]: {
    // or const { state, reducers, effects } = models[key] will throw ts error.
    [key in ModelKey]: any;
  };
};

export type CreateStoreResult<
  T,
  GLOBAL_STATE extends ExtractStateTypeOnlyModels<
    T
  > = ExtractStateTypeOnlyModels<T>,
  GLOBAL_REDUCERS extends ExtractReducersTypeOnlyModels<
    T
  > = ExtractReducersTypeOnlyModels<T>,
  GLOBAL_EFFECTS extends ExtractEffectsTypeOnlyModels<
    T
  > = ExtractEffectsTypeOnlyModels<T>
> = {
  initialState: GLOBAL_STATE;
  reducers: GLOBAL_REDUCERS;
  effects: GLOBAL_EFFECTS;
  createReducer: any;
};

export type CreateStoreFn<
  T extends BasicModelType<T>,
  K extends keyof T = keyof T
> = (configs: {
  models: CreateStoreOnlyModels<T>;
  initialValue?: {
    [key in K]?: any;
  };
}) => CreateStoreResult<T>;

export type CreateStore<T = any> = {
  [key in keyof T]: key extends 'models'
    ? T[key] extends object
      ? {
          [modelKey in keyof T[key]]: T[key] extends object
            ? CreateStore<T[key][modelKey]>
            : T[key];
        }
      : T[key]
    : key extends 'reducers'
    ? {
        [reducerKey in keyof T[key]]: (state: any, payload?: any) => any;
      }
    : key extends 'state'
    ? {
        [stateKey in keyof T[key]]: any;
      }
    : key extends 'effects'
    ? {
        [effectKey in keyof T[key]]: (
          payload: any
        ) => (dispatch: number, getState?: any) => void;
      }
    : never;
};

type ExtractKey<T, key, K extends keyof T = keyof T> = K extends key
  ? T[K]
  : never;

type ExtractModelType<T> = ExtractKey<T, 'models'>;

export type ExtractStateType<
  T,
  Models extends ExtractModelType<T> = ExtractModelType<T>
> = {
  [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};

export type ExtractReducersType<
  T,
  Models extends ExtractModelType<T> = ExtractModelType<T>
> = {
  [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};

export type CreateStoreOnlyModels<
  T extends BasicModelType<T>,
  S extends ExtractStateTypeOnlyModels<T> = ExtractStateTypeOnlyModels<T>
> = {
  [modelKey in keyof T]: {
    [key in keyof T[modelKey]]: key extends 'state'
      ? { [stateKey in keyof T[modelKey][key]]: T[modelKey][key][stateKey] }
      : key extends 'reducers'
      ? {
          [reducerKey in keyof T[modelKey][key]]: (
            state: S[modelKey],
            payload: any
          ) => void;
        }
      : key extends 'effects'
      ? {
          [effectKey in keyof T[modelKey][key]]: (
            payload: any
          ) => (dispatch: Function, getState: () => S) => void;
        }
      : never;
  };
};

export type ExtractStateTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'state'>;
};

export type ExtractReducersTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'reducers'>;
};

export type ExtractEffectsTypeOnlyModels<Models> = {
  [key in keyof Models]: ExtractKey<Models[key], 'effects'>;
};

export type GenericState<T, K extends keyof T> = {
  [key in keyof K]: T[K];
};

export interface ChangedValueGroup {
  storeKey: string;
  changedValue: object;
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
