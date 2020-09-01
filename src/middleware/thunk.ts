import { Action } from '../types';

export default ({ getState, dispatch, effects }) => next => (
  actions: Array<Action> | Function,
  storeKey: string
) => {
  if (typeof actions === 'function') {
    const nextDispatch = (...args: Array<Action>) => {
      const nextArgs = ([] as Array<Action>).concat(...args) || [];
      const actions = nextArgs.map(action => {
        if (!action) return;
        const { type, payload } = action;
        const parts = [storeKey].concat(type.split('/')).slice(-2);
        const nextAction: Action = {
          type: parts.join('/'),
        };
        if (payload) {
          nextAction.payload = payload;
        }

        return nextAction;
      });
      if (actions.length) dispatch(actions);
    };
    return actions(nextDispatch, getState);
  }

  const nextActions = ([] as Array<Action>).concat(actions);
  const reducerActions: Array<Action> = [];
  const effectActions: Array<Action> = [];

  nextActions
    .filter(action => {
      // filter object with `type`
      if (Object.prototype.toString.call(action) === '[object Object]') {
        const { type } = action;
        return !!type;
      }

      return false;
    })
    .forEach(function(action: Action) {
      try {
        const { type } = action;
        const parts = type.split('/');
        const storeKey = parts[0];
        const actionType = parts[1];
        const currentEffects = effects[storeKey];

        if (currentEffects && currentEffects[actionType]) {
          return effectActions.push(action);
        }

        return reducerActions.push(action);
      } catch (info) {
        return false;
        // console.error(info)
        // info process action fails
      }
    });

  if (reducerActions.length) {
    next(reducerActions);
  }

  effectActions.forEach(action => {
    const { type, payload } = action;
    const parts = type.split('/');
    const storeKey = parts[0];
    const actionType = parts[1];
    const currentEffects = effects[storeKey];
    const handler = currentEffects[actionType];

    Promise.resolve().then(() => dispatch(handler(payload), storeKey));
  });
};
