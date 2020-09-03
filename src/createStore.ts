import invariant from 'invariant';

import {
  Action,
  Configs,
  ChangedValueGroup,
  RR,
  SS,
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

  const globalState = {} as T;
  const globalReducers = {} as R;
  const globalEffects = {} as E;
  const keys = Object.keys(models) as Array<K & M & N>;

  keys.forEach(key => {
    const { state, reducers, effects } = models[key];
    const initial = initialValue[key] || {};
    globalState[key as K] = { ...state, ...initial };
    if (reducers) globalReducers[key as M] = reducers;
    if (effects) globalEffects[key as N] = effects;
  });

  return {
    initialState: globalState,
    effects: globalEffects,
    reducers: globalReducers,
    createReducer: combineReducers(globalReducers),
  };
}
