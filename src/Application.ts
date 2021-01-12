import PathNode from './PathNode';
import infoLog from './utils/infoLog';
import { isTypeEqual, isPrimitive, isMutable } from './utils/ifType';
import shallowEqual from './utils/shallowEqual';
import {
  Action,
  IApplication,
  GenericState,
  PendingPatcher,
  PendingAutoRunner,
  ChangedValueGroup,
  UPDATE_TYPE,
  BasicModelType,
} from './types';
import Patcher from './Patcher';
import produce, { ProxyState, StateTrackerUtil } from 'state-tracker';
import AutoRunner from './AutoRunner';
import Store from './Store';
import { warn } from './utils/logger';

class Application<T extends BasicModelType<T>, K extends keyof T>
  implements IApplication<T> {
  private _updateType: UPDATE_TYPE | null;
  // public store: GenericState<T, K>;
  public store: Store<T>;
  public node: PathNode;
  public autoRunnerNode: PathNode;
  public pendingPatchers: Array<PendingPatcher>;
  public pendingAutoRunners: Array<PendingAutoRunner>;
  public namespace: string;
  public strictMode: boolean;
  public proxyState: ProxyState;
  public dirtyState: GenericState<T, K>;
  private _base: GenericState<T, K>;

  constructor({ store, namespace, strictMode }: IApplication<T>) {
    this.store = store;
    this._base = this.store.getState() as any;
    this.node = new PathNode({
      type: 'patcher',
      prop: 'node',
    });
    this.autoRunnerNode = new PathNode({
      type: 'autoRun',
      prop: 'autoRun',
    });
    this.pendingPatchers = [];
    this.pendingAutoRunners = [];
    this.namespace = namespace;
    this.strictMode = strictMode;
    this.proxyState = produce(this._base);
    this.dirtyState = this._base;
    this.getState = this.getState.bind(this);
    this._updateType = null;
  }

  getState() {
    return this.proxyState;
  }

  getUpdateType() {
    return this._updateType;
  }

  update(values: Array<ChangedValueGroup<K>>) {
    try {
      values.forEach(value => this.treeShake(value, this.dirtyState));
      const merged = this.prepareUpdateBase(values);
      StateTrackerUtil.batchRelink(this.proxyState, merged as any);
    } catch (err) {
      infoLog('[Application] update issue ', err);
    }

    this.pendingPatchers.forEach(pendingPatcher => {
      const { patcher, updateType } = pendingPatcher;
      this._updateType = updateType;
      patcher.triggerAutoRun();
    });
    this._updateType = null;

    this.pendingPatchers = [];
    this.pendingAutoRunners = [];
  }

  updateDryRun(values: Array<ChangedValueGroup<K>>): Array<Action> {
    let actions = [] as Array<Action>;
    this.pendingAutoRunners = [];
    try {
      values.forEach(value => this.treeShake(value));
      values.forEach(value => this.treeShakeAutoRunner(value));

      const merged = this.prepareUpdateBase(values);
      this.dirtyState = this._base;
      StateTrackerUtil.batchRelink(this.proxyState, merged as any);
      // this.dirtyState = this.proxyState.batchRelink(merged as any) as any;
      this.pendingAutoRunners.forEach(({ autoRunner }) => {
        actions = actions.concat(autoRunner.triggerAutoRun());
      });
    } catch (err) {
      infoLog('[Application] update issue ', err);
    }

    return actions;
  }

  processSubscriptionOneMoreDeep(
    values: Array<ChangedValueGroup<K>>
  ): Array<Action> {
    let actions = [] as Array<Action>;
    this.pendingAutoRunners = [];
    try {
      values.forEach(value => this.treeShakeAutoRunner(value));
      const merged = this.prepareUpdateBase(values);
      this.dirtyState = this._base;
      StateTrackerUtil.batchRelink(this.proxyState, merged as any);
      this.pendingAutoRunners.forEach(({ autoRunner, storeKey }) => {
        const newActions = autoRunner.triggerAutoRun();
        warn(20007, newActions, storeKey);

        actions = actions.concat(newActions);
      });
    } catch (err) {
      infoLog('[Application] update issue ', err);
    }

    return actions;
  }

  prepareUpdateBase(changeValues: Array<ChangedValueGroup<K>>) {
    const merged = changeValues.reduce<
      {
        [key in K]: ChangedValueGroup<K>;
      }
    >(
      (acc, cur) => {
        const { storeKey, changedValue } = cur;
        if (!acc[storeKey]) {
          acc[storeKey] = {
            storeKey,
            changedValue: {},
          };
        }
        const savedValue = acc[storeKey].changedValue || {};

        acc[storeKey] = {
          storeKey,
          changedValue: {
            ...savedValue,
            ...changedValue,
          },
        };

        return acc;
      },
      {} as {
        [key in K]: ChangedValueGroup<K>;
      }
    );

    const keys = Object.keys(merged);
    return keys.map(key => {
      const value = merged[key as K];
      const { storeKey, changedValue } = value;
      const origin = this._base[storeKey] || ({} as any);

      return {
        path: [storeKey],
        value: {
          ...origin,
          ...changedValue,
        },
      };
    });
  }

  updateBase({
    storeKey,
    changedValue,
  }: {
    storeKey: K;
    changedValue: object;
  }) {
    const modelKey = storeKey;
    const origin = this.store.getModel(storeKey, true);

    // const origin = this._base[storeKey] || ({} as any);
    StateTrackerUtil.relink(this.proxyState, [modelKey as string], {
      ...origin,
      ...changedValue,
    });
  }

  addPatchers(patchers: Array<Patcher>, updateType: UPDATE_TYPE) {
    if (patchers.length) {
      patchers.forEach(patcher => {
        this.pendingPatchers.push({ patcher, updateType });
      });
      patchers.forEach(patcher => {
        patcher.markDirty();
      });
    }
  }

  addAutoRunners(
    autoRunners: Array<AutoRunner>,
    updateType: UPDATE_TYPE,
    storeKey: K
  ) {
    // if (autoRunners.length) {
    //   autoRunners.forEach(autoRunner => {
    //     if (!autoRunner.isDirty()) {
    //       this.pendingAutoRunners.push({ autoRunner, updateType });
    //       autoRunner.markDirty();
    //     }
    //   });
    //   autoRunners.forEach(autoRunner => {
    //     autoRunner.teardown();
    //   });
    // }
    if (autoRunners.length) {
      autoRunners.forEach(autoRunner => {
        this.pendingAutoRunners.push({
          autoRunner,
          updateType,
          storeKey: storeKey as string,
        });
        autoRunner.teardown();
      });
    }
  }

  compare(
    branch: PathNode,
    baseValue: {
      [key: string]: any;
    },
    nextValue: {
      [key: string]: any;
    },
    cb: {
      (pathNode: PathNode, updateType?: UPDATE_TYPE): void;
    }
  ) {
    const keysToCompare = Object.keys(branch.children);

    if (keysToCompare.indexOf('length') !== -1) {
      const oldValue = baseValue.length;
      const newValue = nextValue.length;

      if (newValue < oldValue) {
        cb(branch.children['length'], UPDATE_TYPE.ARRAY_LENGTH_CHANGE);
        return;
      }
    }

    if (branch.getType() === 'autoRun' && baseValue !== nextValue) {
      cb(branch);
    }

    keysToCompare.forEach(key => {
      const oldValue = baseValue[key];
      const newValue = nextValue[key];

      if (shallowEqual(oldValue, newValue)) return;

      if (isTypeEqual(oldValue, newValue)) {
        if (isPrimitive(newValue)) {
          if (oldValue !== newValue) {
            const type =
              key === 'length'
                ? UPDATE_TYPE.ARRAY_LENGTH_CHANGE
                : UPDATE_TYPE.BASIC_VALUE_CHANGE;
            cb(branch.children[key], type);
          }
        }

        if (isMutable(newValue)) {
          const childBranch = branch.children[key];
          this.compare(childBranch, oldValue, newValue, cb);
          return;
        }

        return;
      }
      cb(branch.children[key]);
    });
  }

  treeShakeAutoRunner({
    storeKey,
    changedValue,
  }: {
    storeKey: K;
    changedValue: object;
  }) {
    const branch = this.autoRunnerNode.children[storeKey as any];
    const baseValue = this._base[storeKey];
    const nextValue = { ...baseValue, ...changedValue };

    // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4
    if (!branch) return;
    this.compare(
      branch,
      baseValue,
      nextValue,
      (pathNode: PathNode, updateType?: UPDATE_TYPE) => {
        this.addAutoRunners(
          pathNode.autoRunners.slice(),
          updateType || UPDATE_TYPE.BASIC_VALUE_CHANGE,
          storeKey
        );
      }
    );
  }

  /**
   *
   * Recently it only support `Array`, `Object`, `Number`, `String` and `Boolean` five
   * types..
   */
  treeShake(
    { storeKey, changedValue }: { storeKey: K; changedValue: object },
    possibleBase?: any
  ) {
    const base = possibleBase || this._base;
    const branch = this.node.children[storeKey as any];
    const baseValue = base[storeKey];
    const nextValue = { ...baseValue, ...changedValue };

    // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4
    if (!branch) return;
    this.compare(
      branch,
      baseValue,
      nextValue,
      (pathNode: PathNode, updateType?: UPDATE_TYPE) => {
        this.addPatchers(
          pathNode.patchers.slice(),
          updateType || UPDATE_TYPE.BASIC_VALUE_CHANGE
        );
      }
    );
  }

  addPatcher(patcher: Patcher) {
    const paths = patcher.paths;

    paths.forEach(fullPath => {
      this.node.addPatcher(fullPath, patcher);
    });
  }

  addAutoRunner(autoRunner: AutoRunner) {
    const paths = autoRunner.paths;
    paths.forEach(fullPath => {
      this.autoRunnerNode.addAutoRunner(fullPath, autoRunner);
    });
  }
}

export default Application;
