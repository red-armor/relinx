import { Next, Action, ApplyMiddlewareAPI, BasicModelType } from '../../types';
declare const _default: <T extends BasicModelType<T>>({ getState, }: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action> | Function) => void;
export default _default;
