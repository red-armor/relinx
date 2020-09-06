import invariant from 'invariant';

import {
  Action,
  ChangedValueGroup,
  RR,
  SS,
  CreateStoreOnlyModels,
  ExtractStateTypeOnlyModels,
  ExtractReducersTypeOnlyModels,
  ExtractEffectsTypeOnlyModels,
  EnhanceFunction,
  BasicModelType,
  CreateStoreResult,
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
  T extends BasicModelType<T>,
  MODEL_KEY extends keyof T = keyof T
>(
  configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in MODEL_KEY]?: any;
    };
  },
  enhancer?: EnhanceFunction
): CreateStoreResult<T> {
  if (typeof enhancer === 'function') {
    return enhancer<T, MODEL_KEY>(createStore)(configs);
  }

  const models = configs.models;
  const initialValue = configs.initialValue || ({} as any);

  const globalState = {} as ExtractStateTypeOnlyModels<T>;
  const globalReducers = {} as ExtractReducersTypeOnlyModels<T>;
  const globalEffects = {} as ExtractEffectsTypeOnlyModels<T>;

  const keys = Object.keys(models) as Array<MODEL_KEY>;

  keys.forEach(key => {
    const { state, reducers, effects } = models[key];
    const initial = initialValue[key] || {};
    globalState[key] = { ...state, ...initial };
    if (reducers) globalReducers[key] = reducers as any;
    if (effects) globalEffects[key] = effects as any;
  });

  return {
    initialState: globalState,
    effects: globalEffects,
    reducers: globalReducers,
    createReducer: combineReducers(globalReducers),
  };
}
