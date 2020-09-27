import PathNode from './PathNode';
import infoLog from './utils/infoLog';
import { isTypeEqual, isNumber, isString, isMutable } from './utils/ifType';
import shallowEqual from './utils/shallowEqual';
import {
  IApplication,
  GenericState,
  PendingPatcher,
  ChangedValueGroup,
} from './types';
import Patcher from './Patcher';

class Application<T, K extends keyof T> implements IApplication<T, K> {
  public base: GenericState<T, K>;
  public node: PathNode;
  public pendingPatchers: Array<PendingPatcher>;
  public namespace: string;
  public strictMode: boolean;

  constructor({
    base,
    namespace,
    strictMode,
  }: {
    base: GenericState<T, K>;
    namespace: string;
    strictMode: boolean;
  }) {
    this.base = base;
    this.node = new PathNode();
    this.pendingPatchers = [];
    this.namespace = namespace;
    this.strictMode = strictMode;
  }

  update(values: Array<ChangedValueGroup<K>>) {
    this.pendingPatchers = [];

    try {
      values.forEach(value => this.treeShake(value));
      values.forEach(value => this.updateBase(value));
    } catch (err) {
      infoLog('[Application] update issue ', err);
    }

    this.pendingPatchers.forEach(({ patcher }) => {
      patcher.triggerAutoRun();
    });
  }

  updateBase({
    storeKey,
    changedValue,
  }: {
    storeKey: K;
    changedValue: object;
  }) {
    const origin = this.base[storeKey] || ({} as any);
    this.base[storeKey] = { ...origin, ...changedValue };
  }

  addPatchers(patchers: Array<Patcher>) {
    if (patchers.length) {
      patchers.forEach(patcher => {
        this.pendingPatchers.push({ patcher });
        patcher.markDirty();
      });
    }
  }

  treeShake({ storeKey, changedValue }: { storeKey: K; changedValue: object }) {
    const branch = this.node.children[storeKey as any];
    const baseValue = this.base[storeKey];
    // const rootBaseValue = baseValue;
    const nextValue = { ...baseValue, ...changedValue };

    // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4
    if (!branch) return;

    const toDestroy: Array<Function> = [];
    const compare = (
      branch: PathNode,
      baseValue: {
        [key: string]: any;
      },
      nextValue: {
        [key: string]: any;
      }
    ) => {
      const keysToCompare = Object.keys(branch.children);

      keysToCompare.forEach(key => {
        const oldValue = baseValue[key];
        const newValue = nextValue[key];

        if (shallowEqual(oldValue, newValue)) return;

        if (isTypeEqual(oldValue, newValue)) {
          if (isNumber(newValue) || isString(newValue)) {
            if (oldValue !== newValue) {
              this.addPatchers(branch.children[key].patchers);
            }
          }

          if (isMutable(newValue)) {
            const childBranch = branch.children[key];
            compare(childBranch, oldValue, newValue);
            return;
          }

          return;
        }
        this.addPatchers(branch.children[key].patchers);
      });
    };

    compare(branch, baseValue, nextValue);
    toDestroy.forEach(fn => fn());
  }

  addPatcher(patcher: Patcher) {
    const paths = patcher.paths;

    paths.forEach(fullPath => {
      this.node.addPathNode(fullPath, patcher);
    });
  }

  getStoreData(storeName: K): T[K] {
    const storeValue = this.base[storeName];

    return storeValue;
  }
}

export default Application;
