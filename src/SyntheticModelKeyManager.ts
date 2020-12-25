import { SyntheticModelKeyProps } from './types';
import die from './utils/error';

class SyntheticModelKeyManager {
  private _collection: Map<string, SyntheticModelKey> = new Map();

  add(props: SyntheticModelKeyProps) {
    const { originalKey } = props;
    if (!this._collection.has(originalKey))
      this._collection.set(originalKey, new SyntheticModelKey(props));
  }

  transfer(key: string) {
    if (!this._collection.has(key)) die(10002);
    const current = this._collection.get(key);
    const delegatedModelKey = current!.getTarget();
    const delegated = this._collection.get(delegatedModelKey);
    delegated?.setDelegation(key);
  }

  getDelegationKey(key: string) {
    return this._collection.get(key)?.getCurrent();
  }
}

class SyntheticModelKey {
  private _targetKey: string;
  private _currentKey: string;

  constructor(props: { originalKey: string; targetKey?: string }) {
    const { targetKey, originalKey } = props;

    this._targetKey = targetKey || originalKey;
    this._currentKey = originalKey;
  }

  setDelegation(key: string) {
    this._currentKey = key;
  }

  getCurrent() {
    return this._currentKey;
  }

  getTarget() {
    return this._targetKey;
  }
}

export default SyntheticModelKeyManager;
