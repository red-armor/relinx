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
  ModelKey,
} from './types';
import autoRun from './autoRun';
import SyntheticModelKeyManager from './SyntheticModelKeyManager';

class Store<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T> {
  private _application: Application<T, MODEL_KEY> | null = null;
  private _count: number = 0;
  private _initialValue: {
    [key in MODEL_KEY]: object;
  };
  public dispatch: InternalDispatch = () => {};
  private _state: ExtractStateTypeOnlyModels<
    T
  > = {} as ExtractStateTypeOnlyModels<T>;
  private _reducers: ExtractReducersTypeOnlyModels<
    T
  > = {} as ExtractReducersTypeOnlyModels<T>;
  private _effects: ExtractEffectsTypeOnlyModels<
    T
  > = {} as ExtractEffectsTypeOnlyModels<T>;
  private _pendingAutoRunInitializations: Array<
    PendingAutoRunInitialization
  > = [];
  private _syntheticModelKeyManager: SyntheticModelKeyManager;
  private _pendingActions: Array<Action> = [];
  public initialState: any;
  public subscriptions: {
    [key: string]: Subscription<ExtractStateTypeOnlyModels<T>>;
  } = {};

  constructor(configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in MODEL_KEY]?: any;
    };
  }) {
    const models = configs.models;
    this._initialValue = configs.initialValue || ({} as any);
    this._syntheticModelKeyManager = new SyntheticModelKeyManager({
      store: this,
    });

    const keys = Object.keys(models) as Array<MODEL_KEY>;

    keys.forEach(key => {
      this.injectModel({
        key,
        model: models[key],
      });
    });
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

  clearPendingActions(key: string) {
    this._pendingActions = this._pendingActions.filter(action => {
      const { type } = action;
      const [storeKey] = type.split('/');
      return storeKey !== key;
    });
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

        const syntheticModelKeyManager = this._syntheticModelKeyManager.get(
          storeKey as string
        );
        if (!syntheticModelKeyManager) {
          const list = this._syntheticModelKeyManager.getByTargetKey(
            storeKey as string
          );
          list.forEach(manager => {
            const originalKey = manager.getOriginal();
            const currentState = this.getModel(originalKey as MODEL_KEY, true);
            const usedReducer = this._reducers[originalKey as MODEL_KEY];
            if (usedReducer) {
              const changedValue = usedReducer[actionType](
                currentState,
                payload
              );
              changedValueGroup.push({
                storeKey: modelKey,
                changedValue,
              });
            }
          });
        }

        const modelKey = this.getModelKey(storeKey) as MODEL_KEY;

        const usedReducer = this._reducers[modelKey];

        // If usedReducer is null, Maybe you have dispatched an unregistered action.
        // On this condition, put these actions to `this._pendingActions`
        if (!usedReducer) {
          this._pendingActions.push(action);
        } else if (usedReducer[actionType]) {
          const currentState = this.getModel(modelKey);
          const changedValue = usedReducer[actionType](currentState, payload);
          changedValueGroup.push({
            storeKey: modelKey,
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
          // ...this._application?.base,
          ...this.getState(),
        } as ExtractStateTypeOnlyModels<T>;
        const newState = {
          // ...this._application?.base,
          ...this.getState(),
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
    let actions = [] as Array<Action>;

    if (this._pendingAutoRunInitializations.length) {
      this._pendingAutoRunInitializations.forEach(initialization => {
        const { autoRunFn, modelKey } = initialization;
        const initialActions = autoRun(autoRunFn, this._application!, modelKey);
        actions = actions.concat(initialActions);
      });
      this._pendingAutoRunInitializations = [];
    }

    const changeValues = this.resolveActions(actions);
    changeValues.forEach(value => this._application?.updateBase(value));
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

  getModelKey(key: MODEL_KEY) {
    return this._syntheticModelKeyManager.getDelegationKey(key as string);
  }

  /**
   *
   * @param key modelKey/storeKey, if it is a storeKey, then it should be transformed before use.
   * @param falsy indicate key should be transformed or not.
   */
  getModel(key: MODEL_KEY, falsy?: boolean) {
    const modelKey = falsy ? key : this.getModelKey(key);
    return this._state[modelKey as MODEL_KEY];
  }

  transfer(key: ModelKey) {
    this._syntheticModelKeyManager.transfer(key);
  }

  transferModel(from: MODEL_KEY, to: MODEL_KEY) {
    if (this._state[from]) this._state[to] = this._state[from];
    if (this._reducers[from]) this._reducers[to] = this._reducers[from];
    if (this._effects[from]) this._effects[to] = this._effects[from];
  }

  injectModel({
    key,
    model,
    initialValue = {},
    targetKey,
  }: {
    key: MODEL_KEY;
    model: any;
    initialValue?: any;
    targetKey?: MODEL_KEY;
  }) {
    const syntheticManager = this._syntheticModelKeyManager.add({
      originalKey: key as string,
      // target should not be set with default value!!
      targetKey: targetKey as string,
    });
    const { state, reducers = {}, effects = {} } = model;

    const _internalInitialValue =
      this._initialValue[syntheticManager!.getTarget() as MODEL_KEY] || {};
    const subscriptions = model.subscriptions || ({} as AutoRunSubscriptions);
    // consume all the pending actions.
    let base = this.getModel(key) || {
      ...state,
      ..._internalInitialValue,
      ...initialValue,
    };

    const nextPendingActions = this._pendingActions.filter(action => {
      const { type, payload } = action;
      const [storeKey, actionType] = type.split('/') as [
        MODEL_KEY,
        keyof ExtractReducersTypeOnlyModels<T>
      ];

      // const manager = this._syntheticModelKeyManager.get(storeKey as string);

      // only process action with current injected model's tag
      // if (storeKey === key) {
      // if (this.getModelKey(storeKey) === key) {
      if (syntheticManager!.getTarget() === storeKey) {
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

        if (
          !syntheticManager?.isSyntheticMode() ||
          syntheticManager.getCommitted()
        ) {
          return false;
        }
      }

      return true;
    });

    this._state[key] = base;
    this._pendingActions = nextPendingActions;

    this._application?.updateBase({
      storeKey: key,
      changedValue: base,
    });

    if (reducers) this._reducers[key] = reducers as any;
    if (effects) this._effects[key] = effects as any;

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
        const initialActions = autoRun<T, MODEL_KEY>(
          autoRunFn,
          this._application,
          key as string
        );
        const changedValues = this.resolveActions(initialActions);
        changedValues.forEach(value => this._application?.updateBase(value));
      }
    });
  }
}

export default Store;
