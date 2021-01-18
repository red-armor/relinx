import invariant from 'invariant';
import { SyntheticModelKeyProps, ModelKey } from './types';
import { error } from './utils/logger';
import Store from './Store';

class SyntheticModelKeyManager {
  private _store: Store<any, any>;

  constructor({ store }: { store: Store<any, any> }) {
    this._store = store;
  }

  private _collection: Map<string, SyntheticModelKey> = new Map();

  add(props: SyntheticModelKeyProps) {
    const { originalKey } = props;
    if (!this._collection.has(originalKey))
      this._collection.set(originalKey, new SyntheticModelKey(props));
    return this._collection.get(originalKey);
  }

  transfer(key: string) {
    if (!this._collection.has(key)) error(10002);
    const current = this._collection.get(key);
    const delegatedModelKey = current!.getTarget();

    if (!this._collection.has(delegatedModelKey)) {
      this._collection.set(
        delegatedModelKey,
        new SyntheticModelKey({
          originalKey: delegatedModelKey,
        })
      );
    }

    this._store.transferModel(key as ModelKey, delegatedModelKey as ModelKey);

    // if (this._store._state[key]) {
    //   this._store._state[delegatedModelKey] = this._store._state[key]
    //   this._store._reducers[delegatedModelKey] = this._store._reducers[key]
    //   this._store._effects[delegatedModelKey] = this._store._effects[key]
    // }

    // if (delegatedModelKey !== key) {
    //   delete this._store._state[key]
    //   delete this._store._reducers[key]
    //   delete this._store._effects[key]
    // }

    const delegated = this._collection.get(delegatedModelKey);
    delegated?.setDelegation(key);
    // to handle autoRun condition!!
    if (current?.getCurrent() !== key) {
      current?.setDelegation(key);
    }
    this._store.clearPendingActions(delegatedModelKey);
  }

  getDelegationKey(key: string) {
    return this._collection.get(key)?.getCurrent();
  }

  get(key: string) {
    return this._collection.get(key);
  }

  getByTargetKey(key: string) {
    const results = [] as Array<SyntheticModelKey>;
    this._collection.forEach(syntheticModelKey => {
      if (syntheticModelKey.getTarget() === key) {
        results.push(syntheticModelKey);
      }
    });
    return results;
  }
}

class SyntheticModelKey {
  private _targetKey: string | undefined;
  private _originalKey: string;
  private _currentKey: string;
  private _syntheticMode: boolean;
  private _committed: boolean;

  constructor(props: { originalKey: string; targetKey?: string }) {
    const { targetKey, originalKey } = props;

    invariant(
      !targetKey || (targetKey && targetKey !== originalKey),
      `Synthetic mode is only used for condition when 'targetKey(${targetKey})' is not equal to 'originalKey(${originalKey})'`
    );

    this._syntheticMode = !!targetKey && targetKey !== originalKey;
    this._targetKey = targetKey;
    this._originalKey = originalKey;
    this._currentKey = originalKey;
    this._committed = !targetKey;
  }

  isSyntheticMode() {
    return this._syntheticMode;
  }

  setDelegation(key: string) {
    invariant(
      !this.isSyntheticMode() || !this._committed,
      `It is not allow to re-delegate ${this._originalKey} with ${key}`
    );
    this._currentKey = key;
    this._committed = true;
  }

  getOriginal() {
    return this._originalKey;
  }

  getCurrent() {
    if (!this.isSyntheticMode() && this._committed) return this._originalKey;
    return this._currentKey;
  }

  getCommitted() {
    return this._committed;
  }

  getTarget() {
    return this._targetKey || this._originalKey;
  }
}

export default SyntheticModelKeyManager;
