import {
  Action,
  InternalDispatch,
  Subscription,
  BasicModelType,
  ChangedValueGroup,
  CreateStoreOnlyModels,
  ExtractStateTypeOnlyModels,
  ExtractEffectsTypeOnlyModels,
  ExtractReducersTypeOnlyModels,
  ModelKey,
} from './types';
import SyntheticKeyModelManager, {
  SyntheticKeyModel,
} from './SyntheticKeyModelManager';
import { error, warn, infoChangedValue, logActivity } from './utils/logger';
import {
  produce,
  IStateTracker,
  Reaction,
  StateTrackerUtil,
  ActivityToken,
} from 'state-tracker';
import isPlainObject from './utils/isPlainObject';
import { bailBooleanValue } from './utils/commons';
import TaskQueue from './TaskQueue';

let subscriptionCount = 0;

const NODE_ENV = process.env.NODE_ENV;

class Store<T extends BasicModelType<T>, MODEL_KEY extends keyof T = keyof T> {
  private _models: CreateStoreOnlyModels<T, ExtractStateTypeOnlyModels<T>>;
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
  private _syntheticKeyModelManager: SyntheticKeyModelManager;

  private _shouldLogChangedValue: boolean = false;
  private _shouldLogRerender: boolean = false;
  private _shouldLogActivity: boolean = false;

  // To temp save actions dispatched before model is injected
  private _pendingActions: Array<Action> = [];

  public initialState: any;
  public subscriptions: {
    [key: string]: Subscription<ExtractStateTypeOnlyModels<T>>;
  } = {};

  private _queue: TaskQueue = new TaskQueue({
    after: (changedValues: Array<ChangedValueGroup<MODEL_KEY>>) => {
      const proxyState = this.getState() as IStateTracker;
      const nextState = { ...proxyState };

      if (changedValues.length) {
        changedValues.forEach(value => {
          const { storeKey, changedValue } = value;
          const modelKey = this.getModelKey(storeKey)!;
          const currentState = nextState[modelKey];
          nextState[modelKey] = {
            ...currentState,
            ...changedValue,
          };
        });
      }

      StateTrackerUtil.perform(proxyState, nextState, {
        afterCallback: () => {
          const keys = Object.keys(proxyState);
          keys.forEach(key => {
            proxyState[key] = nextState[key];
          });
        },
        stateCompareLevel: 1,
      });
    },
  });

  constructor(configs: {
    models: CreateStoreOnlyModels<T>;
    initialValue?: {
      [key in MODEL_KEY]?: any;
    };
  }) {
    // const models = configs.models;
    this._initialValue = configs.initialValue || ({} as any);
    this._syntheticKeyModelManager = new SyntheticKeyModelManager({
      store: this,
    });
    this._models = configs.models;
    this._state = produce({}) as ExtractStateTypeOnlyModels<T>;
    const keys = Object.keys(this._models) as Array<MODEL_KEY>;

    keys.forEach(key => {
      this.injectModel({
        key,
        model: this._models[key],
      });
    });
  }

  updateLogConfig(config: {
    shouldLogActivity?: boolean;
    shouldLogRerender?: boolean;
    shouldLogChangedValue?: boolean;
  }) {
    const {
      shouldLogRerender,
      shouldLogChangedValue,
      shouldLogActivity,
    } = config;

    this._shouldLogRerender = !!shouldLogRerender;
    this._shouldLogChangedValue = !!shouldLogChangedValue;

    this._shouldLogActivity = !!shouldLogActivity;
  }

  getState(): ExtractStateTypeOnlyModels<T> {
    return this._state as ExtractStateTypeOnlyModels<T>;
  }

  getReducers(): ExtractReducersTypeOnlyModels<T> {
    return this._reducers;
  }

  getEffects(): ExtractEffectsTypeOnlyModels<T> {
    return this._effects;
  }

  unsafeDispatch(actions: Action) {
    warn(20008, actions);
    this.dispatch(actions);
  }

  decorateDispatch(chainedMiddleware: Function) {
    this.dispatch = chainedMiddleware(this.setValue.bind(this));
  }

  rebuildActions(keyModel: SyntheticKeyModel, actions: Array<Action>) {
    const modelKey = keyModel.getCurrent();
    let nextActions = actions;

    if (isPlainObject(nextActions)) {
      nextActions = ([] as Array<Action>).concat(nextActions);
    }

    if (Array.isArray(nextActions)) {
      nextActions = nextActions
        .map(action => {
          if (isPlainObject(action)) {
            const { type, payload } = action;
            // if type is not in `namespace/type` format, then add modelKey as default namespace.
            if (!/\//.test(type)) {
              return {
                type: `${modelKey}/${type}`,
                payload,
              };
            }
          }
          return null as any;
        })
        .filter(v => v);
    }
    return nextActions;
  }

  resolveActions(actions: Array<Action>) {
    try {
      return actions.reduce<Array<ChangedValueGroup<MODEL_KEY>>>(
        (changedValueGroup, action) => {
          const { type, payload } = action;
          const [storeKey, actionType] = type.split('/') as [
            MODEL_KEY,
            keyof ExtractReducersTypeOnlyModels<T>
          ];

          const modelKey = this.getModelKey(storeKey) as MODEL_KEY;

          const usedReducer = this._reducers[modelKey];

          // If usedReducer is null, Maybe you have dispatched an unregistered action.
          // On this condition, put these actions to `this._pendingActions`
          if (!usedReducer) {
            this._pendingActions.push(action);
          } else if (usedReducer[actionType]) {
            const targetKey = this.getModelTargetKey(storeKey);
            const keyModels = this._syntheticKeyModelManager.getByTargetKey(
              targetKey as string
            );

            keyModels.forEach(keyModel => {
              // 对于reducer，state value需要从当前使用的model中拿值；originalKey是一个不再变化的key，
              // 一旦modelKey被确定，
              // 这个时候的key是targetKey；所以这里需要使用getCurrent
              const originalKey = keyModel.getCurrent() as MODEL_KEY;
              const currentState = this.getModel(originalKey, true);
              const usedReducer = this._reducers[originalKey];
              const changedValue = usedReducer[actionType](
                currentState,
                payload
              );
              // partial value, will make aggregation.
              changedValueGroup.push({
                storeKey: originalKey,
                changedValue: {
                  ...changedValue,
                },
              });
            });
          } else {
            warn(20004, type);
          }

          return changedValueGroup;
        },
        []
      );
    } catch (err) {
      error(10003);
      return [];
    }
  }

  setValue(actions: Array<Action>) {
    this._queue.nextTick(() => {
      const nextActions = ([] as Array<Action>).concat(actions);
      const changedValues = this.resolveActions(nextActions);
      return changedValues;
    });
  }

  generateSubscriptionKey(): string {
    return `store_${this._count++}`;
  }

  getModelKey(key: MODEL_KEY) {
    return this._syntheticKeyModelManager.getCurrentKey(key as string);
  }
  getModelTargetKey(key: MODEL_KEY) {
    return this._syntheticKeyModelManager.getTargetKey(key as string);
  }

  /**
   *
   * @param key modelKey/storeKey, if it is a storeKey, then it should be transformed before use.
   * @param falsy indicate key should be transformed or not.
   */
  getModel(key: MODEL_KEY, falsy?: boolean) {
    const modelKey = falsy ? key : this.getModelKey(key);
    const state = this.getState();
    return state[modelKey as MODEL_KEY];
  }

  transfer(key: ModelKey) {
    this._syntheticKeyModelManager.transfer(key);
  }

  transferModel(from: MODEL_KEY, to: MODEL_KEY) {
    if (from !== to) {
      warn(20001, to, from);
      const state = this.getState();
      if (state[from]) state[to] = { ...state[from] };
      if (this._reducers[from]) this._reducers[to] = this._reducers[from];
      if (this._effects[from]) this._effects[to] = this._effects[from];

      const actionsObject = {} as {
        [key: string]: Action;
      };

      // consume pending effects
      this._pendingActions = this._pendingActions.filter(action => {
        const { type } = action;
        const [storeKey, actionType] = type.split('/') as [
          MODEL_KEY,
          keyof ExtractReducersTypeOnlyModels<T>
        ];
        const effects = this._effects[to];

        // clean up all pending actions with `${targetKey}` prefix.
        // But, effects should be consumed..
        if (storeKey === to) {
          if (effects && effects[actionType]) {
            actionsObject[actionType as any] = effects[actionType];
            warn(20005, type);
          }

          return false;
        }

        return true;
      });

      this.dispatch(Object.values(actionsObject));
    }
  }

  subscriptionScheduler(
    keyModel: SyntheticKeyModel,
    displayName: string,
    getReaction: () => Reaction | null
  ) {
    return (fn: Function) => {
      const reaction = getReaction();
      if (reaction && reaction.getChangedValue()) {
        infoChangedValue(30002, displayName, reaction.getChangedValue());
      }

      if (this._shouldLogRerender) {
        warn(20010, displayName, 'state');
      }

      const actions = fn({
        getState: () => this.getState(),
        dispatch: this.dispatch.bind(this),
      });

      const nextActions = this.rebuildActions(keyModel, actions);

      if (Array.isArray(nextActions)) {
        this.dispatch(nextActions);
      }
    };
  }

  injectModel({
    key,
    model,
    targetKey,
  }: {
    key: MODEL_KEY;
    model: any;
    initialValue?: any;
    targetKey?: MODEL_KEY;
  }) {
    const syntheticKeyModel = this._syntheticKeyModelManager.add({
      // originalKey should be unique, targetKey could be the same !!!
      originalKey: key as string,
      // target should not be set with default value!!
      targetKey: targetKey as string,
    });
    const { state, reducers = {}, effects = {}, subscriptions = {} } = model;

    // initial value should be used used, no matter model is committed or not.
    const _internalInitialValue =
      this._initialValue[syntheticKeyModel!.getTarget() as MODEL_KEY] || {};

    // consume all the pending actions.
    let modelBase = this.getModel(key) || {
      ...state,
      ..._internalInitialValue,
    };

    if (reducers) this._reducers[key] = reducers as any;
    if (effects) this._effects[key] = effects as any;

    // consume the pending actions in current injecting model
    const nextPendingActions = this._pendingActions.filter(action => {
      const { type, payload } = action;
      const [storeKey, actionType] = type.split('/') as [
        MODEL_KEY,
        keyof ExtractReducersTypeOnlyModels<T>
      ];
      // only process action with current injected model's tag
      if (syntheticKeyModel!.getTarget() === storeKey) {
        const reducer = reducers[actionType];
        const effect = effects[actionType];

        let nextState = modelBase;

        if (typeof reducer === 'function') {
          nextState = reducer(modelBase, payload);
          modelBase = { ...modelBase, ...nextState };
          // what if pending action is an effect. call dispatch again to re-run...
          // But, there is still a condition, effects followed by normal reducer...
          // The result may override by effect...
        } else if (typeof effect === 'function') {
          // Pending effect only be trigger directly on `un-synthetic mode`.
          if (syntheticKeyModel && !syntheticKeyModel.isSyntheticMode())
            this.dispatch(action);
          warn(20002, type);
        } else {
          warn(20003, type);
        }

        // only if model is committed, the pending actions could be cleared.
        if (
          !syntheticKeyModel.isSyntheticMode() ||
          syntheticKeyModel.getCommitted()
        ) {
          return false;
        }
      }

      return true;
    });
    this._pendingActions = nextPendingActions;

    const applicationState = this.getState() as IStateTracker;

    StateTrackerUtil.perform(
      applicationState,
      {
        ...applicationState,
        [key]: modelBase,
      },
      {
        afterCallback: () => {
          applicationState[key as string] = modelBase;
        },
        stateCompareLevel: 1,
      }
    );

    const modelKey = this.getModelKey(key)!;

    for (let key in subscriptions) {
      const subscription = subscriptions[key];
      let func = subscription;
      let options = {};

      let nextShouldLogChangedValue = false;
      let nextShouldLogActivity = false;
      let ignoreSettingStateCompareLevel = false;

      if (isPlainObject(subscription)) {
        const {
          fn,
          shouldLogChangedValue,
          shouldLogActivity,
          ignoreSettingStateCompareLevel: definedIgnoreSettingStateCompareLevel,
          ...restSubscription
        } = subscription;
        func = fn;
        nextShouldLogChangedValue =
          NODE_ENV !== 'production' &&
          bailBooleanValue(shouldLogChangedValue, this._shouldLogChangedValue);
        nextShouldLogActivity =
          NODE_ENV !== 'production' &&
          bailBooleanValue(shouldLogActivity, this._shouldLogActivity);
        options = { ...restSubscription };
        ignoreSettingStateCompareLevel = !!definedIgnoreSettingStateCompareLevel;
      }

      const nextFunc = function(this: Reaction, ...args: Array<any>) {
        try {
          const result = func.apply(this, args);
          if (result === -1 || result === 'unhandled') {
            !ignoreSettingStateCompareLevel && this.setStateCompareLevel(0);
            return null;
          }

          !ignoreSettingStateCompareLevel && this.setStateCompareLevel(1);
          return result;
        } catch (err) {
          !ignoreSettingStateCompareLevel && this.setStateCompareLevel(0);
          error(10004, err, func.displayName);
        }
      };
      nextFunc.displayName = `subscription_${modelKey}_${subscriptionCount++}`;

      let reaction: null | Reaction = null;
      const getReaction = () => reaction;
      const reactionOptions: any = {
        fn: nextFunc,
        state: applicationState,
        scheduler: this.subscriptionScheduler(
          syntheticKeyModel,
          nextFunc.displayName,
          getReaction
        ),
        ...options,
      };

      if (nextShouldLogActivity) {
        reactionOptions.activityListener = (activity: ActivityToken) =>
          logActivity(activity);
      }

      if (nextShouldLogChangedValue) reactionOptions.changedValue = {};

      // TODO: in synthetic mode, not used model reaction should be destroyed
      reaction = new Reaction(reactionOptions);
      syntheticKeyModel.addDisposers(reaction.dispose);
    }
  }
}

export default Store;
