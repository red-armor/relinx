import invariant from 'invariant';
import { SyntheticModelKeyProps, ModelKey } from './types';
import { error } from './utils/logger';
import Store from './Store';

class SyntheticKeyModelManager {
  private _store: Store<any, any>;
  private _targetKeyToSyntheticKeyModelMap: Map<
    string,
    Array<SyntheticKeyModel>
  > = new Map();

  constructor({ store }: { store: Store<any, any> }) {
    this._store = store;
  }

  private _collection: Map<string, SyntheticKeyModel> = new Map();

  add(props: SyntheticModelKeyProps) {
    const { originalKey, targetKey } = props;
    if (!this._collection.has(originalKey))
      this._collection.set(
        originalKey,
        new SyntheticKeyModel({
          ...props,
          manager: this,
        })
      );

    const syntheticKeyModel = this._collection.get(originalKey)!;
    const key = targetKey || originalKey;
    if (!this._targetKeyToSyntheticKeyModelMap.has(key)) {
      this._targetKeyToSyntheticKeyModelMap.set(key, [syntheticKeyModel]);
    } else {
      this._targetKeyToSyntheticKeyModelMap.get(key)!.push(syntheticKeyModel);
    }
    return syntheticKeyModel;
  }

  cleanup(targetKey: string) {
    const syntheticKeyModels =
      this._targetKeyToSyntheticKeyModelMap.get(targetKey) || [];
    syntheticKeyModels
      .filter(syntheticKeyModel => !syntheticKeyModel.getCommitted())
      .forEach(syntheticKeyModel => syntheticKeyModel.dispose());
    // remove useless
    this._targetKeyToSyntheticKeyModelMap.set(
      targetKey,
      syntheticKeyModels.filter(syntheticKeyModel =>
        syntheticKeyModel.getCommitted()
      )
    );
  }

  transfer(key: string) {
    if (!this._collection.has(key)) error(10002);
    const current = this._collection.get(key);
    const targetKey = current!.getTarget();

    if (!this._collection.has(targetKey)) {
      this._collection.set(targetKey, current!);
    }

    current!.commit();
    this._store.transferModel(key as ModelKey, targetKey as ModelKey);
  }

  getCurrentKey(key: string) {
    const value = this._collection.get(key);
    if (value) return value.getCurrent();
    return;
  }

  getTargetKey(key: string) {
    const value = this._collection.get(key);
    if (value) return value.getTarget();
    return;
  }

  get(key: string) {
    return this._collection.get(key);
  }

  getByTargetKey(key: string): Array<SyntheticKeyModel> {
    return this._targetKeyToSyntheticKeyModelMap.get(key) || [];
  }
}

export class SyntheticKeyModel {
  private _targetKey: string | undefined;
  private _originalKey: string;
  private _currentKey: string;
  private _syntheticMode: boolean;
  private _committed: boolean;
  private _disposers: Set<Function> = new Set();

  readonly _manager: SyntheticKeyModelManager;

  constructor(props: {
    originalKey: string;
    targetKey?: string;
    manager: SyntheticKeyModelManager;
  }) {
    const { targetKey, originalKey, manager } = props;

    invariant(
      !targetKey || (targetKey && targetKey !== originalKey),
      `Synthetic mode is only used for condition when 'targetKey(${targetKey})' ` +
        `is not equal to 'originalKey(${originalKey})'`
    );

    this._syntheticMode = !!targetKey && targetKey !== originalKey;
    this._targetKey = targetKey || originalKey;
    this._originalKey = originalKey;
    this._currentKey = originalKey;
    this._committed = !targetKey;
    this._manager = manager;
  }

  isSyntheticMode() {
    return this._syntheticMode;
  }

  // for clean up
  addDisposers(fn: Function) {
    if (typeof fn === 'function') {
      this._disposers.add(fn);
    }
  }

  dispose() {
    Array.from(this._disposers).forEach(disposer => disposer());
  }

  commit() {
    invariant(
      !this.isSyntheticMode() || !this._committed,
      `It is not allow to re-delegate ${this._originalKey} with ${this._targetKey}`
    );
    this._currentKey = this._targetKey!;
    this._committed = true;
    this._manager.cleanup(this.getTarget());
  }

  getOriginal() {
    return this._originalKey;
  }

  getCurrent() {
    return this._currentKey;
  }

  getCommitted() {
    return this._committed;
  }

  getTarget() {
    return this._targetKey || this._originalKey;
  }
}

export default SyntheticKeyModelManager;
