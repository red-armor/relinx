import Application from './Application';
import {
  Action,
  InternalDispatch,
  Subscription,
  BasicModelType,
  AutoRunSubscriptions,
  ChangedValueGroup,
  CreateStoreOnlyModels,
  ExtractStateTypeOnlyModels,
  ExtractEffectsTypeOnlyModels,
  ExtractReducersTypeOnlyModels,
  PendingAutoRunInitialization,
} from './types';
import autoRun from './autoRun';

class Store<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T> {
  private _application: Application<T, MODEL_KEY> | null;
  private _count: number;
  public dispatch: InternalDispatch;
  private _state: ExtractStateTypeOnlyModels<T>;
  private _reducers: ExtractReducersTypeOnlyModels<T>;
  private _effects: ExtractEffectsTypeOnlyModels<T>;
  private _pendingAutoRunInitializations: Array<PendingAutoRunInitialization>;
  private _pendingActions: Array<Action>;
  public initialState: any;
  public subscriptions: {
    [key: string]: Subscription<ExtractStateTypeOnlyModels<T>>;
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
    this._pendingActions = [];
    this._pendingAutoRunInitializations = [];

    const keys = Object.keys(models) as Array<MODEL_KEY>;

    keys.forEach(key => {
      this.injectModel(key, models[key], initialValue[key]);
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

  resolveActions(actions: Array<Action>) {
    return actions.reduce<Array<ChangedValueGroup<MODEL_KEY>>>(
      (changedValueGroup, action) => {
        if (!this._application) return [];
        const { type, payload } = action;
        const [storeKey, actionType] = type.split('/') as [
          MODEL_KEY,
          keyof ExtractReducersTypeOnlyModels<T>
        ];
        const usedReducer = this._reducers[storeKey];

        // If usedReducer is null, Maybe you have dispatched an unregistered action.
        // On this condition, put these actions to `this._pendingActions`
        if (!usedReducer) {
          this._pendingActions.push(action);
        } else if (usedReducer[actionType]) {
          const currentState = this._application.base[storeKey];
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
  }

  setValue(actions: Array<Action>) {
    const nextActions = ([] as Array<Action>).concat(actions);
    const changedValues = this.resolveActions(nextActions);

    if (changedValues.length) {
      // updateDryRun do two things
      // 1. resolve pendingPatchers
      // 2. assign application.base with new value.
      // Note: on this step, pendingPatchers do not execute
      const derivedActions =
        this._application?.updateDryRun(changedValues) || [];
      // model.subscriptions may cause new value update..
      const derivedChangedValue = this.resolveActions(derivedActions!);
      this._application?.update(derivedChangedValue);

      const storeSubscriptionsKeys = Object.keys(this.subscriptions);
      const storeSubscriptionsKeysLength = storeSubscriptionsKeys.length;
      // Only if there are store subscriptions. it requires to calculate old and new value..
      if (storeSubscriptionsKeysLength) {
        const toObject = changedValues.reduce<
          {
            [key in MODEL_KEY]: object;
          }
        >(
          (acc, cur) => {
            const { storeKey, changedValue } = cur;
            acc[storeKey] = {
              ...acc[storeKey],
              ...changedValue,
            };
            return acc;
          },
          {} as {
            [key in MODEL_KEY]: object;
          }
        );
        const oldState = {
          ...this._application?.base,
        } as ExtractStateTypeOnlyModels<T>;
        const newState = {
          ...this._application?.base,
          ...toObject,
        } as ExtractStateTypeOnlyModels<T>;
        for (let i = 0; i < storeSubscriptionsKeysLength; i++) {
          const key = storeSubscriptionsKeys[i];
          const subscription = this.subscriptions[key];
          subscription({
            oldState,
            newState,
            diff: toObject as Partial<ExtractStateTypeOnlyModels<T>>,
          });
        }
      }
    }
  }

  bindApplication(application: Application<T, MODEL_KEY>) {
    this._application = application;
    this.runPendingAutoRunInitialization();
  }

  runPendingAutoRunInitialization() {
    if (this._pendingAutoRunInitializations.length) {
      this._pendingAutoRunInitializations.forEach(initialization => {
        const { autoRunFn, modelKey } = initialization;
        autoRun(autoRunFn, this._application!, modelKey);
      });
      this._pendingAutoRunInitializations = [];
    }
  }

  decorateDispatch(chainedMiddleware: Function) {
    this.dispatch = chainedMiddleware(this.setValue.bind(this));
  }

  generateSubscriptionKey(): string {
    return `store_${this._count++}`;
  }

  subscribe(
    subscription: Subscription<ExtractStateTypeOnlyModels<T>>
  ): Function {
    const key = this.generateSubscriptionKey();
    this.subscriptions[key] = subscription;
    return () => delete this.subscriptions[key];
  }

  injectModel(key: MODEL_KEY, model: any, initialValue: any = {}) {
    const { state, reducers = {}, effects = {} } = model;
    const subscriptions = model.subscriptions || ({} as AutoRunSubscriptions);
    // consume all the pending actions.
    let base = this._application?.getStoreData(key) || {
      ...state,
      ...initialValue,
    };

    const nextPendingActions = this._pendingActions.filter(action => {
      const { type, payload } = action;
      const [storeKey, actionType] = type.split('/') as [
        MODEL_KEY,
        keyof ExtractReducersTypeOnlyModels<T>
      ];

      // only process action with current injected model's tag
      if (key === storeKey) {
        const reducer = reducers[actionType];
        const effect = effects[actionType];

        let nextState = base;

        if (typeof reducer === 'function') {
          nextState = reducer(base, payload);
          base = { ...base, ...nextState };
          // what if pending action is an effect. call dispatch again to re-run...
          // But, there is still a condition, effects followed by normal reducer...
          // The result may override by effect...
        } else if (typeof effect === 'function') {
          this.dispatch(action);
        } else {
          console.warn(
            `Maybe you have dispatched an unregistered model's effect action(${action})`
          );
        }
      }

      return storeKey !== key;
    });

    const subscriptionsKeys = Object.keys(subscriptions);
    subscriptionsKeys.forEach(autoRunKey => {
      const autoRunFn = subscriptions[autoRunKey];

      if (!this._application) {
        this._pendingAutoRunInitializations.push({
          modelKey: key as string,
          autoRunKey,
          autoRunFn,
        });
      } else {
        autoRun<T, MODEL_KEY>(autoRunFn, this._application, key as string);
      }
    });

    this._state[key] = base;
    this._pendingActions = nextPendingActions;

    this._application?.updateBase({
      storeKey: key,
      changedValue: base,
    });

    if (reducers) this._reducers[key] = reducers as any;
    if (effects) this._effects[key] = effects as any;
  }
}

export default Store;
