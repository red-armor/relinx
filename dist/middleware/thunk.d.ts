import { Next, Action, BasicModelType, ApplyMiddlewareAPI } from '../types';
declare const _default: <T extends BasicModelType<T>>({ getState, dispatch, store, }: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action> | Function, storeKey: keyof T) => any;
/**
 * The basic format of action type is `storeKey/${type}`.
 * Only action in effect could ignore `storeKey`
 */
export default _default;
