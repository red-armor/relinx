import { ProxyState } from 'state-tracker';
import { Action } from './createStore';
export declare type Subscription<T> = ({ oldState, newState, diff, }: {
    oldState: T;
    newState: T;
    diff: Partial<T>;
}) => any;
export declare type AutoRunSubscriptionProps = {
    state: ProxyState;
};
export declare type AutoRunSubscription = {
    ({ state }: AutoRunSubscriptionProps): Action | Array<Action>;
};
export declare type AutoRunSubscriptions = {
    [key: string]: AutoRunSubscription;
};
export declare type PendingAutoRunInitialization = {
    modelKey: string;
    autoRunKey: string;
    autoRunFn: Function;
};
