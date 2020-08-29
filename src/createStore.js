import invariant from 'invariant';

const combineReducers = reducers => state => (_, actions) => {
  const nextActions = [].concat(actions);

  const changedValues = nextActions.reduce((changedValueGroup, action) => {
    const { type, payload } = action;
    const [storeKey, actionType] = type.split('/');
    const usedReducer = reducers[storeKey];

    invariant(usedReducer, `Reducer missing for type \`${type}\``) // eslint-disable-line

    const currentState = state[storeKey];
    if (usedReducer[actionType]) {
      const changedValue = usedReducer[actionType](currentState, payload);

      changedValueGroup.push({
        storeKey,
        changedValue,
      });
    } else {
      console.warn(`Do not have action '${actionType}'`) // eslint-disable-line
    }

    return changedValueGroup;
  }, []);

  if (changedValues.length) return changedValues;
  return [];
};

export default function createStore(configs, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(configs);
  }

  const { models, initialValue = {} } = configs;
  const keys = Object.keys(models);
  const globalState = {};
  const globalReducers = {};
  const globalEffects = {};

  keys.forEach(key => {
    const { state, reducers, effects } = models[key];
    const initial = initialValue[key] || {};
    globalState[key] = { ...state, ...initial };
    globalReducers[key] = reducers;
    globalEffects[key] = effects;
  });

  return {
    initialState: globalState,
    createReducer: combineReducers(globalReducers),
    effects: globalEffects,
    reducers: globalReducers,
  };
}
