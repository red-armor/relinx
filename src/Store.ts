// @ts-nocheck
import invariant from 'invariant';
import Application from './Application';
import {
  Action,
  Dispatch,
  Subscription,
  BasicModelType,
  ChangedValueGroup,
  CreateStoreOnlyModels,
  ExtractStateTypeOnlyModels,
  ExtractEffectsTypeOnlyModels,
  ExtractReducersTypeOnlyModels,
} from './types';

class Store<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T> {
  private _application: Application<T, MODEL_KEY> | null;
  private _count: number;
  public dispatch: Dispatch;
  private _state: ExtractStateTypeOnlyModels<T>;
  private _reducers: ExtractReducersTypeOnlyModels<T>;
  private _effects: ExtractEffectsTypeOnlyModels<T>;
  public initialState: any;
  public subscriptions: {
    [key: string]: Function;
  };

  constructor(configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in MODEL_KEY]?: any;
    };
  }) {
    const models = configs.models;
    const initialValue = configs.initialValue || ({} as any);

    this._state = {} as ExtractStateTypeOnlyModels<T>;
    this._reducers = {} as ExtractReducersTypeOnlyModels<T>;
    this._effects = {} as ExtractEffectsTypeOnlyModels<T>;

    const keys = Object.keys(models) as Array<MODEL_KEY>;

    keys.forEach(key => {
      const { state, reducers, effects } = models[key];
      const initial = initialValue[key] || {};
      this._state[key] = { ...state, ...initial };
      if (reducers) this._reducers[key] = reducers as any;
      if (effects) this._effects[key] = effects as any;
    });

    this.dispatch = () => {};
    this._application = null;
    this.subscriptions = {};
    this._count = 0;
  }

  getState(): ExtractStateTypeOnlyModels<T> {
    return this._state;
  }

  getReducers(): ExtractReducersTypeOnlyModels<T> {
    return this._reducers;
  }

  getEffects(): ExtractEffectsTypeOnlyModels<T> {
    return this._effects;
  }

  setValue(actions: Array<Action>) {
    const nextActions = ([] as Array<Action>).concat(actions);
    const changedValues = nextActions.reduce<Array<ChangedValueGroup>>(
      (changedValueGroup, action) => {
        if (!this._application) return [];

        const { type, payload } = action;
        const [storeKey, actionType] = type.split('/');

        console.log('this reducers ', this._reducers, storeKey, actionType);

        const usedReducer = this._reducers[storeKey];

        invariant(usedReducer, `Reducer missing for type \`${type}\``);

        const currentState = this._application.base[storeKey];

        if (usedReducer[actionType]) {
          const changedValue = usedReducer[actionType](currentState, payload);

          changedValueGroup.push({
            storeKey,
            changedValue,
          });
        } else {
          console.warn(`Do not have action '${actionType}'`);
        }

        return changedValueGroup;
      },
      []
    );

    if (changedValues.length) {
      this._application?.update(changedValues);
    }
  }

  bindApplication(application: Application<T, MODEL_KEY>) {
    this._application = application;
  }

  decorateDispatch(chainedMiddleware: Function) {
    this.dispatch = chainedMiddleware(this.setValue.bind(this));
  }

  generateSubscriptionKey(): string {
    return `store_${this._count++}`;
  }

  subscribe(subscription: Subscription) {
    const key = this.generateSubscriptionKey();
    this.subscriptions[key] = subscription;
    return () => delete this.subscriptions[key];
  }

  injectModel(key: string, model: any, initialValue: any = {}) {
    const { state, reducers, effects } = model;
    this._state[key] = { ...state, ...initialValue };
    if (reducers) this._reducers[key] = reducers as any;
    if (effects) this._effects[key] = effects as any;
  }
}

export default Store;
