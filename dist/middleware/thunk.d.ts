import { Action, Next, ApplyMiddlewareAPI } from '../types';
declare const _default: <T>({ getState, dispatch, effects }: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action> | Function, storeKey: keyof T) => any;
/**
 * The basic format of action type is `storeKey/${type}`.
 * Only action in effect could ignore `storeKey`
 */
export default _default;
