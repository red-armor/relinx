import invariant from 'invariant';
import PathNode from './PathNode';
import is from './utils/is';
import infoLog from './utils/infoLog';
import { isObject, isMutable, isTypeEqual } from './utils/ifType';
import diffArraySimple from './utils/diffArraySimple';
import {
  IApplication,
  GenericState,
  PendingPatcher,
  ChangedValueGroup,
  Operation,
} from './types';
import Patcher from './Patcher';

const DEBUG = false;
const MINIMUS_RE_RENDER = false;

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

    if (DEBUG) {
      infoLog('[Application] top most node ', this.node, this.base);
      infoLog('[Application] changed value ', values);
    }

    try {
      values.forEach(value => this.treeShake(value));
      values.forEach(value => this.updateBase(value));
    } catch (err) {
      infoLog('[Application] update issue ', err);
    }

    const finalPatchers = [];
    const len = this.pendingPatchers.length;

    for (let i = 0; i < len; i++) {
      const current = this.pendingPatchers[i].patcher;
      const l = finalPatchers.length;
      let found = false;
      for (let y = 0; y < l; y++) {
        // @ts-ignore
        const base = finalPatchers[y];
        if (current.belongs(base)) {
          found = true;
          break;
        }
        if (base.belongs(current)) {
          finalPatchers.splice(y, 1);
          finalPatchers.splice(y, 0, current);
          found = true;
          break;
        }
      }
      if (!found) finalPatchers.push(current);
    }

    if (MINIMUS_RE_RENDER) {
      finalPatchers.forEach(patcher => patcher.triggerAutoRun());
    } else if (this.pendingPatchers.length) {
      // const patcherId = generatePatcherId({ namespace: this.namespace });
      this.pendingPatchers.forEach(({ patcher }) => {
        patcher.triggerAutoRun();
      });
    }

    if (DEBUG) {
      if (MINIMUS_RE_RENDER) {
        const final = finalPatchers.map(patcher => patcher.id);
        infoLog('[Application] final patchers ', final, finalPatchers);
      } else {
        const pending = this.pendingPatchers.map(({ patcher }) => patcher.id);
        infoLog(
          '[Application] pending patchers ',
          pending,
          this.pendingPatchers
        );
      }
    }
  }

  updateBase({
    storeKey,
    changedValue,
  }: {
    storeKey: K;
    changedValue: object;
  }) {
    const origin = this.base[storeKey];
    this.base[storeKey] = { ...origin, ...changedValue };
  }

  treeShake({ storeKey, changedValue }: { storeKey: K; changedValue: object }) {
    const branch = this.node.children[storeKey as any];
    const baseValue = this.base[storeKey];
    const rootBaseValue = baseValue;
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
      },
      collections: Array<string>,
      operation: Array<Operation>
    ) => {
      if (is(baseValue, nextValue)) return;

      // TODO, add description...only primitive type react...
      if (!isTypeEqual(baseValue, nextValue) || !isMutable(nextValue)) {
        if (branch.patchers.length) {
          branch.patchers.forEach(patcher => {
            this.pendingPatchers.push({ collections, patcher, operation });
          });
          // delete should be placed after collection...
          // `branch.patchers` will be modified on `markDirty`..
          // branch.patchers.forEach(patcher => patcher.markDirtyAll())
          branch.patchers.forEach(patcher => patcher.markDirty());
        }
      }

      const caredKeys = Object.keys(branch.children);
      let keysToCompare = caredKeys;
      let keysToDestroy: Array<string> = [];
      const currentOperation: Array<Operation> = [];

      // 处理，如果说array中的一项被删除了。。。。
      if (isTypeEqual(baseValue, nextValue) && Array.isArray(nextValue)) {
        const baseLength = (baseValue as any).length;
        const nextLength = nextValue.length;

        if (nextLength < baseLength) {
          keysToCompare = caredKeys.filter(
            key => parseInt(key, 10) < nextLength || key === 'length'
          );
          keysToDestroy = caredKeys.filter(key => {
            if (parseInt(key, 10) >= nextLength) {
              currentOperation.push({
                path: collections.concat(key),
                isDelete: true,
              });
              return true;
            }
            return false;
          });
        }
      }

      if (isObject(nextValue) && isObject(baseValue)) {
        const nextKeys = Object.keys(nextValue);
        const prevKeys = Object.keys(baseValue);
        const removed = diffArraySimple(prevKeys, nextKeys);

        if (removed.length) {
          toDestroy.push(
            ((branch: PathNode, removed: Array<string>) => {
              removed.forEach(key => {
                const childBranch = branch.children[key];
                if (childBranch) childBranch.destroyPathNode();
              });
            }).bind(null, branch, removed)
          );
        }
      }

      if (this.strictMode) {
        keysToCompare.forEach(key => {
          const childBranch = branch.children[key];
          if (!baseValue || typeof baseValue[key] === 'undefined') {
            childBranch.patchers.forEach(patcher => {
              const displayName = patcher.displayName;
              const joinedPath = collections.concat(key).join('.');
              console.warn('root base value ', rootBaseValue) // eslint-disable-line
              console.warn( // eslint-disable-line
                `Maybe you are using an un-declared props %c${joinedPath}` +
                  ` %cin Component %c${displayName} %cYou'd better declare this prop in model first,` +
                  'or component may not re-render when value changes on ES5.',
                'color: #ff4d4f; font-weight: bold',
                '',
                'color: #7cb305; font-weight: bold',
                ''
              );
            });
          }
        });
      }

      keysToCompare.forEach(key => {
        const childBranch = branch.children[key];
        const childBaseValue = baseValue ? baseValue[key] : undefined;
        // 当一个对象中的key被删除的时候，那么它的值就是undefined
        const childNextValue = nextValue ? nextValue[key] : undefined;

        compare(
          childBranch,
          childBaseValue,
          childNextValue,
          collections.concat(key),
          currentOperation
        );
      });

      if (keysToDestroy.length) {
        toDestroy.push(
          ((branch: PathNode, keysToDestroy: Array<string>) => {
            keysToDestroy.forEach(key => {
              const childBranch = branch.children[key];
              if (childBranch) childBranch.destroyPathNode();
            });
          }).bind(null, branch, keysToDestroy)
        );
      }
    };

    compare(branch, baseValue, nextValue, [storeKey as any], []);
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

    // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
    invariant(
      !!storeValue,
      `Invalid storeName '${storeName}'.` +
        'Please ensure `base[storeName]` return non-undefined value '
    );

    return storeValue;
  }
}

export default Application;
