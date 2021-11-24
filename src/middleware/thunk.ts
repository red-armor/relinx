import {
  Next,
  Action,
  ThunkFn,
  InternalDispatch,
  ThunkDispatch,
  BasicModelType,
  ApplyMiddlewareAPI,
  ExtractEffectsTypeOnlyModels,
} from '../types';
import { error } from '../utils/logger';

/**
 * The basic format of action type is `storeKey/${type}`.
 * Only action in effect could ignore `storeKey`
 */
export default <T extends BasicModelType<T>>({
  getState,
  dispatch,
  store,
}: ApplyMiddlewareAPI<T>) => (next: Next) => (
  actions: Array<Action> | Function,
  storeKey: keyof T
) => {
  if (typeof actions === 'function') {
    const nextDispatch = (thunkActions: Array<Action> | Action) => {
      const nextArgs = ([] as Array<Action>).concat(thunkActions) || [];
      const actions = nextArgs
        .map(action => {
          if (!action) return null;
          const { type, payload } = action;
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
      if (actions.length) dispatch && (dispatch as InternalDispatch)(actions);
    };
    // effect should be put in nextTick. or getState will not return the latest
    // value (when actions has reducer and effects the same).
    // TODO: It may better to put in TaskQueue nextTick
    Promise.resolve().then(() => actions(nextDispatch, getState));
    return;
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
        const modelKey = store.getModelKey(storeKey) as any;
        const currentEffects = store.getEffects()[modelKey as keyof T];

        if (currentEffects && currentEffects[actionType]) {
          return effectActions.push(action);
        }

        // If you dispatch an unregistered model's effect, it will be
        // considered as an normal reducer action..
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

    try {
      const modelKey = store.getModelKey(storeKey);
      if (modelKey) {
        const currentEffects = store.getEffects()[modelKey as keyof T];
        const handler = (currentEffects[actionType] as unknown) as ThunkFn<T>;

        // dispatch is `nextDispatch` on the beginning. storeKey no need to transform
        dispatch && (dispatch as ThunkDispatch<T>)(handler(payload), storeKey);
      }
    } catch (err) {
      error(10001, err, type);
    }
  });
};
