import { Action } from './createStore';
export interface Collection {
    actionKey: string;
    namespace: string;
    remover: () => void;
    actions: Array<Action>;
}
export declare type Collections = Array<Collection>;
export interface GlobalAction {
    namespace: string;
    actions: Array<Action>;
}
export declare type GlobalActions = Array<GlobalAction>;
export interface GlobalDispatch {
    (actions: GlobalActions | GlobalAction): void;
}
