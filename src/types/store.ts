import { ProxyState } from 'state-tracker';
import { Action } from './createStore';

export type Subscription<T> = ({
  oldState,
  newState,
  diff,
}: {
  oldState: T;
  newState: T;
  diff: Partial<T>;
}) => any;

export type AutoRunSubscriptionProps = {
  state: ProxyState;
};

export type AutoRunSubscription = {
  ({ state }: AutoRunSubscriptionProps): Action | Array<Action>;
};

export type AutoRunSubscriptions = {
  [key: string]: AutoRunSubscription;
};

export type PendingAutoRunInitialization = {
  modelKey: string;
  autoRunKey: string;
  autoRunFn: Function;
};
