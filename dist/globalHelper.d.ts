import { Collections, Action } from './types';
declare class GlobalHelper {
    collections: Collections;
    constructor();
    addAction(actionKey: string, namespace: string, actions: Array<Action>): void;
}
declare const _default: GlobalHelper;
export default _default;
