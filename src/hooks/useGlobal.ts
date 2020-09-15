import invariant from 'invariant';
import globalHelper from '../globalHelper';
import { generateRandomGlobalActionKey } from '../utils/key';
import {
  GlobalActions,
  GlobalAction,
  GlobalDispatch,
  Collections,
} from '../types';

const dispatch = (actions: GlobalActions | GlobalAction) => {
  const next = ([] as GlobalActions).concat(actions);

  next.forEach(action => {
    const { namespace: targetNamespace, actions } = action;
    invariant(targetNamespace, '`namespace` is required for global action');
    invariant(actions, '`actions` is required for global action');
    const actionKey = generateRandomGlobalActionKey();
    globalHelper.addAction(actionKey, targetNamespace, actions);
  });
};

// It is not a official documentation compatible Hooks API.
// For global state, data change responsive is not required, which means
// value's change will not trigger any UI/data update...
export default (): [Collections, GlobalDispatch] => [
  globalHelper.collections,
  dispatch,
];
