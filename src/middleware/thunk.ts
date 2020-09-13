// @ts-nocheck

import {
  Action,
  Next,
  ApplyMiddlewareAPI,
  ExtractEffectsTypeOnlyModels,
  ThunkFn,
  Dispatch,
  ThunkDispatch,
} from '../types';

/**
 * The basic format of action type is `storeKey/${type}`.
 * Only action in effect could ignore `storeKey`
 */
export default <T>({ getState, dispatch, store }: ApplyMiddlewareAPI<T>) => (
  next: Next
) => (actions: Array<Action> | Function, storeKey: keyof T) => {
  if (typeof actions === 'function') {
    const nextDispatch = (thunkActions: Array<Action> | Action) => {
      const nextArgs = ([] as Array<Action>).concat(thunkActions) || [];
      const actions = nextArgs
        .map(action => {
          if (!action) return null;
          const { type, payload } = action;
          // TODO: ts
          const parts = [storeKey].concat(type.split('/') as any).slice(-2);
          const nextAction: Action = {
            type: parts.join('/'),
          };
          if (payload) {
            nextAction.payload = payload;
          }

          return nextAction;
        })
        .filter(v => !!v) as Array<Action>;
      if (actions.length) dispatch && (dispatch as Dispatch)(actions);
    };
    return actions(nextDispatch, getState);
  }

  const nextActions = ([] as Array<Action>).concat(actions);
  const reducerActions: Array<Action> = [];
  const effectActions: Array<Action> = [];

  nextActions
    .filter(action => {
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
        const storeKey = parts[0] as keyof T;
        const actionType = parts[1] as keyof ExtractEffectsTypeOnlyModels<
          T
        >[typeof storeKey];
        const currentEffects = store.getEffects()[storeKey];

        console.log('current ', currentEffects, storeKey, store);

        if (currentEffects && currentEffects[actionType]) {
          return effectActions.push(action);
        }

        return reducerActions.push(action);
      } catch (info) {
        return false;
      }
    });

  if (reducerActions.length) {
    next(reducerActions);
  }

  effectActions.forEach(action => {
    const { type, payload } = action;
    const parts = type.split('/');
    const storeKey = parts[0] as keyof T;
    const actionType = parts[1] as keyof ExtractEffectsTypeOnlyModels<
      T
    >[keyof T];
    const currentEffects = store.getEffects()[storeKey];
    const handler = (currentEffects[actionType] as unknown) as ThunkFn<T>;

    dispatch && (dispatch as ThunkDispatch<T>)(handler(payload), storeKey);
    // Promise.resolve()
    //   .then(
    //     () =>
    //       dispatch && (dispatch as ThunkDispatch<T>)(handler(payload), storeKey)
    //   )
    //   .catch(err => {
    //     // temp log error info
    //     console.error(err);
    //   });
  });
};
