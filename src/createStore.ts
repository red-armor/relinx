import invariant from 'invariant';

import {
  Action,
  Configs,
  ChangedValueGroup,
  RR,
  SS,
  Model,
  CombineReducersReducer1,
} from './types';

// const combineReducers: CombineReducers = reducers => state => (_, action) => {
const combineReducers = <R, M extends keyof R>(reducers: RR<R, M>) => <
  T,
  K extends keyof T
>(
  state: SS<T, K>
) => (_: any, actions: Array<Action>) => {
  const nextActions = ([] as Array<Action>).concat(actions);

  const changedValues = nextActions.reduce<Array<ChangedValueGroup>>(
    (changedValueGroup, action) => {
      const { type, payload } = action;
      const [storeKey, actionType] = type.split('/');
      const usedReducer = reducers[storeKey as M];

      invariant(usedReducer, `Reducer missing for type \`${type}\``);

      const currentState = state[storeKey as K];
      if (usedReducer[actionType]) {
        const changedValue = usedReducer[actionType](currentState, payload);

        changedValueGroup.push({
          storeKey,
          changedValue,
        });
      } else {
        console.warn(`Do not have action '${actionType}'`);
      }

      return changedValueGroup;
    },
    []
  );

  if (changedValues.length) return changedValues;
  return [];
};

type GetState<
  NextModel extends {
    [key in keyof NextModel]: Model;
  }
> = NextModel extends {
  state: any;
}
  ? {
      [key in keyof NextModel]: NextModel[key];
    }
  : never;

type GetReducer<NextModel extends any> = NextModel extends {
  state: any;
}
  ? {
      [key in keyof NextModel]: NextModel[key];
    }[keyof 'reducers']
  : never;

type GetEffect<NextModel extends any> = NextModel extends {
  state: any;
}
  ? {
      [key in keyof NextModel]: NextModel[key];
    }[keyof 'effects']
  : never;

export default function createStore<
  SS = any,
  SSK extends keyof SS = any,
  S = any,
  SK extends keyof S = any,
  R = any,
  RK extends keyof R = any,
  E = any,
  EK extends keyof E = any
>(
  configs: Configs<SS, S, SK, R, RK, E, EK>,
  enhancer?: Function
): {
  initialState: {
    [key in SSK]: SS[key];
  };
  effects: E;
  reducers: R;
  createReducer: CombineReducersReducer1;
} {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(configs);
  }

  const models = configs.models;
  const initialValue = configs.initialValue || ({} as any);

  const globalState = {} as {
    [key in SSK]: GetState<SS[key]>;
  };
  const globalReducers = {} as {
    [key in SSK]: GetReducer<SS[key]>;
  };
  const globalEffects = {} as {
    [key in SSK]: GetEffect<SS[key]>;
  };
  const keys = Object.keys(models) as Array<SSK>;

  keys.forEach(key => {
    const { state, reducers, effects } = models[key];
    const initial = initialValue[key] || {};
    globalState[key] = { ...state, ...initial };
    if (reducers) globalReducers[key] = reducers;
    if (effects) globalEffects[key] = effects;
  });

  return {
    initialState: globalState,
    effects: globalEffects,
    reducers: globalReducers,
    createReducer: combineReducers(globalReducers),
  };
}
