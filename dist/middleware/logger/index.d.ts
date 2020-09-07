import { Next, Action, ApplyMiddlewareAPI } from '../../types';
declare const _default: <T>({ getState }: ApplyMiddlewareAPI<T>) => (next: Next) => (actions: Array<Action>) => void;
export default _default;
