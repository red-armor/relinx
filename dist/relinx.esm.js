import React, { createContext, useRef, useContext, useState, useEffect, useCallback } from 'react';
import produce from 'state-tracker';
import invariant from 'invariant';

const calculateChangeBits = () => 0b00;

const noop = () => {};

const defaultValue = {
  computation: null,
  dispatch: noop,
  attachStoreName: noop,
  useProxy: true,
  namespace: null,
  patcher: null,
  trackerNode: null,
  useRelinkMode: true,
  application: null
}; // @ts-ignore

var context = /*#__PURE__*/
createContext(defaultValue, // @ts-ignore
calculateChangeBits);

/**
 * Intentional info-level logging for clear separation from ad-hoc console debug logging.
 */
function infoLog(...args) {
  console.log('**DEBUG**', ...args); // eslint-disable-line
}

const DEBUG = false;

class PathNode {
  constructor(prop, parent) {
    this.prop = prop || 'root';
    this.parent = parent;
    this.children = {};
    this.patchers = [];
  }

  addPathNode(path, patcher) {
    try {
      const len = path.length;
      path.reduce((node, cur, index) => {
        // path中前面的值都是为了让我们定位到最后的需要关心的位置
        if (!node.children[cur]) node.children[cur] = new PathNode(cur, node); // 只有到达`path`的最后一个`prop`时，才会进行patcher的添加

        if (index === len - 1) {
          const childNode = node.children[cur];

          if (DEBUG) {
            infoLog('[PathNode add patcher]', childNode, patcher);
          }

          if (childNode.patchers) {
            childNode.patchers.push(patcher);
            patcher.addRemover(() => {
              const index = childNode.patchers.indexOf(patcher);

              if (DEBUG) {
                infoLog('[PathNode remove patcher]', patcher.id, childNode);
              }

              if (index !== -1) {
                childNode.patchers.splice(index, 1);
              }
            });
          }
        }

        return node.children[cur];
      }, this);
    } catch (err) {// console.log('err ', err)
    }
  }

  destroyPathNode() {
    try {
      this.patchers.forEach(patcher => patcher.destroyPatcher());

      if (this.children) {
        const childKeys = Object.keys(this.children);
        childKeys.forEach(key => {
          const pathNode = this.children[key];
          pathNode.destroyPathNode();
        });
      }

      if (this.parent) {
        delete this.parent.children[this.prop];
      }
    } catch (err) {
      infoLog('[PathNode destroy issue]', err);
    }
  }

}

const toString =
/*#__PURE__*/
Function.call.bind(Object.prototype.toString);

const isObject = obj => toString(obj) === '[object Object]';
const isArray = obj => toString(obj) === '[object Array]';
const isNumber = obj => toString(obj) === '[object Number]';
const isString = obj => toString(obj) === '[object String]';
const isBoolean = obj => toString(obj) === '[object Boolean]';
const isMutable = obj => isObject(obj) || isArray(obj);
const isPrimitive = obj => isNumber(obj) || isString(obj) || isBoolean(obj);
const isTypeEqual = (o1, o2) => toString(o1) === toString(o2);

// https://github.com/facebook/react/blob/144328fe81719e916b946e22660479e31561bb0b/packages/shared/shallowEqual.js#L36-L68

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-self-compare */
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */

function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } // Step 6.a: NaN == NaN


  return x !== x && y !== y;
}
/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */


function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  } // Test for A's keys different from B.


  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

class Application {
  constructor({
    base,
    namespace,
    strictMode
  }) {
    this.base = base;
    this.node = new PathNode();
    this.pendingPatchers = [];
    this.namespace = namespace;
    this.strictMode = strictMode;
    this.proxyState = produce(this.base);
  }

  update(values) {
    this.pendingPatchers = []; // console.log('this node ', this.node)

    try {
      values.forEach(value => this.treeShake(value));
      values.forEach(value => this.updateBase(value));
    } catch (err) {
      infoLog('[Application] update issue ', err);
    } // console.log('change value ', values, this.pendingPatchers.slice())


    this.pendingPatchers.forEach(({
      patcher
    }) => {
      patcher.triggerAutoRun();
    });
  }

  updateBase({
    storeKey,
    changedValue
  }) {
    const origin = this.base[storeKey] || {};
    this.proxyState.relink([storeKey], { ...origin,
      ...changedValue
    });
  }

  addPatchers(patchers) {
    // console.log('patchers ', patchers.slice())
    if (patchers.length) {
      patchers.forEach(patcher => {
        this.pendingPatchers.push({
          patcher
        });
      });
      patchers.forEach(patcher => {
        patcher.markDirty();
      });
    }
  }
  /**
   *
   * Recently it only support `Array`, `Object`, `Number`, `String` and `Boolean` five
   * types..
   */


  treeShake({
    storeKey,
    changedValue
  }) {
    const branch = this.node.children[storeKey];
    const baseValue = this.base[storeKey];
    const nextValue = { ...baseValue,
      ...changedValue
    }; // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4

    if (!branch) return;
    const toDestroy = [];

    const compare = (branch, baseValue, nextValue) => {
      const keysToCompare = Object.keys(branch.children);
      keysToCompare.forEach(key => {
        const oldValue = baseValue[key];
        const newValue = nextValue[key];
        if (shallowEqual(oldValue, newValue)) return;

        if (isTypeEqual(oldValue, newValue)) {
          if (isPrimitive(newValue)) {
            if (oldValue !== newValue) {
              // console.log('add patcher ', oldValue, newValue, key)
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

  addPatcher(patcher) {
    const paths = patcher.paths;
    paths.forEach(fullPath => {
      this.node.addPathNode(fullPath, patcher);
    });
  }

  getStoreData(storeName) {
    const storeValue = this.base[storeName];
    return storeValue;
  }

}

// https://github.com/facebook/draft-js/blob/master/src/model/keys/generateRandomKey.js
const seenKeys = {};
const MULTIPLIER =
/*#__PURE__*/
Math.pow(2, 24); // eslint-disable-line

const generateNamespaceKey = () => {
  let key;

  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    // eslint-disable-line
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }

  seenKeys[key] = true;
  return key;
};
const patcherSeenKeys = {};
const generatePatcherKey = ({
  namespace,
  componentName
}) => {
  if (!patcherSeenKeys[namespace]) patcherSeenKeys[namespace] = {};
  const count = patcherSeenKeys[namespace][componentName] || 0;
  const next = count + 1;
  patcherSeenKeys[namespace][componentName] = next;
  return `${namespace}_${componentName}_patcher_${count}`;
};
const generateRandomGlobalActionKey = () => Math.floor(Math.random() * MULTIPLIER).toString(32); // eslint-disable-line

// https://stackoverflow.com/questions/53958028/how-to-use-generics-in-props-in-react-in-a-functional-component

function Provider({
  store,
  children,
  namespace,
  useProxy = true,
  useRelinkMode = true,
  strictMode = false,
  useScope = true
}) {
  const namespaceRef = useRef(namespace || generateNamespaceKey());
  const application = useRef();

  if (!application.current) {
    application.current = new Application({
      base: store.getState(),
      namespace: namespaceRef.current,
      strictMode
    });
  }

  store.bindApplication(application.current);
  const dispatch = store.dispatch;
  const contextValue = useRef({ ...defaultValue,
    dispatch,
    useProxy,
    useScope,
    useRelinkMode,
    namespace: namespaceRef.current,
    application: application.current
  });
  return React.createElement(context.Provider, {
    value: contextValue.current
  }, children);
}

// https://github.com/reduxjs/redux/blob/master/src/compose.ts
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function applyMiddleware(...middleware) {
  const nextMiddleware = [...middleware];
  return createStore => config => {
    const store = createStore(config);
    const initialState = store.getState();
    const api = {
      dispatch: (actions, ...rest) => store.dispatch(actions, ...rest),
      getState: () => initialState,
      store
    };
    const chain = nextMiddleware.map(middleware => middleware(api));
    store.decorateDispatch(compose(...chain));
    return store;
  };
}

class Store {
  constructor(configs) {
    const models = configs.models;
    const initialValue = configs.initialValue || {};
    this._state = {};
    this._reducers = {};
    this._effects = {};
    this._pendingActions = [];
    const keys = Object.keys(models);
    keys.forEach(key => {
      this.injectModel(key, models[key], initialValue[key]);
    });

    this.dispatch = () => {};

    this._application = null;
    this.subscriptions = {};
    this._count = 0;
  }

  getState() {
    return this._state;
  }

  getReducers() {
    return this._reducers;
  }

  getEffects() {
    return this._effects;
  }

  setValue(actions) {
    const nextActions = [].concat(actions);
    const changedValues = nextActions.reduce((changedValueGroup, action) => {
      if (!this._application) return [];
      const {
        type,
        payload
      } = action;
      const [storeKey, actionType] = type.split('/');
      const usedReducer = this._reducers[storeKey]; // If usedReducer is null, Maybe you have dispatched an unregistered action.
      // On this condition, put these actions to `this._pendingActions`

      if (!usedReducer) {
        this._pendingActions.push(action);
      } else if (usedReducer[actionType]) {
        const currentState = this._application.base[storeKey];
        const changedValue = usedReducer[actionType](currentState, payload);
        changedValueGroup.push({
          storeKey,
          changedValue
        });
      } else {
        console.warn(`Do not have action '${actionType}'`);
      }

      return changedValueGroup;
    }, []);

    if (changedValues.length) {
      var _this$_application, _this$_application2, _this$_application3;

      const toObject = changedValues.reduce((acc, cur) => {
        const {
          storeKey,
          changedValue
        } = cur;
        acc[storeKey] = changedValue;
        return acc;
      }, {});
      const oldState = { ...((_this$_application = this._application) === null || _this$_application === void 0 ? void 0 : _this$_application.base)
      };
      const newState = { ...((_this$_application2 = this._application) === null || _this$_application2 === void 0 ? void 0 : _this$_application2.base),
        ...toObject
      };
      (_this$_application3 = this._application) === null || _this$_application3 === void 0 ? void 0 : _this$_application3.update(changedValues);

      for (let key in this.subscriptions) {
        const subscription = this.subscriptions[key];
        subscription({
          oldState,
          newState,
          diff: toObject
        });
      }
    }
  }

  bindApplication(application) {
    this._application = application;
  }

  decorateDispatch(chainedMiddleware) {
    this.dispatch = chainedMiddleware(this.setValue.bind(this));
  }

  generateSubscriptionKey() {
    return `store_${this._count++}`;
  }

  subscribe(subscription) {
    const key = this.generateSubscriptionKey();
    this.subscriptions[key] = subscription;
    return () => delete this.subscriptions[key];
  }

  injectModel(key, model, initialValue = {}) {
    var _this$_application4, _this$_application5;

    const {
      state,
      reducers = {},
      effects = {}
    } = model; // consume all the pending actions.

    let base = ((_this$_application4 = this._application) === null || _this$_application4 === void 0 ? void 0 : _this$_application4.getStoreData(key)) || { ...state,
      ...initialValue
    };

    const nextPendingActions = this._pendingActions.filter(action => {
      const {
        type,
        payload
      } = action;
      const [storeKey, actionType] = type.split('/'); // only process action with current injected model's tag

      if (key === storeKey) {
        const reducer = reducers[actionType];
        const effect = effects[actionType];
        let nextState = base;

        if (typeof reducer === 'function') {
          nextState = reducer(base, payload);
          base = { ...base,
            ...nextState
          }; // what if pending action is an effect. call dispatch again to re-run...
          // But, there is still a condition, effects followed by normal reducer...
          // The result may override by effect...
        } else if (typeof effect === 'function') {
          this.dispatch(action);
        } else {
          console.warn(`Maybe you have dispatched an unregistered model's effect action(${action})`);
        }
      }

      return storeKey !== key;
    });

    this._state[key] = base;
    this._pendingActions = nextPendingActions;
    (_this$_application5 = this._application) === null || _this$_application5 === void 0 ? void 0 : _this$_application5.updateBase({
      storeKey: key,
      changedValue: base
    });
    if (reducers) this._reducers[key] = reducers;
    if (effects) this._effects[key] = effects;
  }

}

function createStore(configs, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(configs);
  }

  return new Store(configs);
}

var useRelinx = (storeName => {
  const {
    dispatch,
    application,
    componentName
  } = useContext(context);
  const proxyState = application === null || application === void 0 ? void 0 : application.proxyState;
  const state = proxyState.peek([storeName]);
  const tracker = state.getTracker();
  tracker.setContext(componentName);
  return [state, dispatch];
});

var useDispatch = (() => {
  const {
    dispatch
  } = useContext(context);
  return [dispatch];
});

var useNamespace = (() => {
  const {
    namespace
  } = useContext(context);
  return namespace;
});

class GlobalHelper {
  constructor() {
    this.collections = [];
  }

  addAction(actionKey, namespace, actions) {
    this.collections.push({
      actionKey,
      namespace,
      remover: () => {
        const index = this.collections.findIndex(({
          actionKey: key
        }) => key === actionKey);
        if (index !== -1) this.collections.splice(index, 1);
      },
      actions
    });
  }

}

var globalHelper = /*#__PURE__*/
new GlobalHelper();

const dispatch = actions => {
  const next = [].concat(actions);
  next.forEach(action => {
    const {
      namespace: targetNamespace,
      actions
    } = action;
    !targetNamespace ? process.env.NODE_ENV !== "production" ? invariant(false, '`namespace` is required for global action') : invariant(false) : void 0;
    !actions ? process.env.NODE_ENV !== "production" ? invariant(false, '`actions` is required for global action') : invariant(false) : void 0;
    const actionKey = generateRandomGlobalActionKey();
    globalHelper.addAction(actionKey, targetNamespace, actions);
  });
}; // It is not a official documentation compatible Hooks API.
// For global state, data change responsive is not required, which means
// value's change will not trigger any UI/data update...


var useGlobal = (() => [globalHelper.collections, dispatch]);

/**
 * The basic format of action type is `storeKey/${type}`.
 * Only action in effect could ignore `storeKey`
 */
var thunk = (({
  getState,
  dispatch,
  store
}) => next => (actions, storeKey) => {
  if (typeof actions === 'function') {
    const nextDispatch = thunkActions => {
      const nextArgs = [].concat(thunkActions) || [];
      const actions = nextArgs.map(action => {
        if (!action) return null;
        const {
          type,
          payload
        } = action;
        const parts = [storeKey].concat(type.split('/')).slice(-2);
        const nextAction = {
          type: parts.join('/')
        };

        if (payload) {
          nextAction.payload = payload;
        }

        return nextAction;
      }).filter(v => !!v);
      if (actions.length) dispatch && dispatch(actions);
    };

    return actions(nextDispatch, getState);
  }

  const nextActions = [].concat(actions);
  const reducerActions = [];
  const effectActions = [];
  nextActions.filter(action => {
    if (Object.prototype.toString.call(action) === '[object Object]') {
      const {
        type
      } = action;
      return !!type;
    }

    return false;
  }).forEach(function (action) {
    try {
      const {
        type
      } = action;
      const parts = type.split('/');
      const storeKey = parts[0];
      const actionType = parts[1];
      const currentEffects = store.getEffects()[storeKey];

      if (currentEffects && currentEffects[actionType]) {
        return effectActions.push(action);
      } // If you dispatch an unregistered model's effect, it will be
      // considered as an normal reducer action..


      return reducerActions.push(action);
    } catch (info) {
      return false;
    }
  });

  if (reducerActions.length) {
    next(reducerActions);
  }

  effectActions.forEach(action => {
    const {
      type,
      payload
    } = action;
    const parts = type.split('/');
    const storeKey = parts[0];
    const actionType = parts[1];
    const currentEffects = store.getEffects()[storeKey];
    const handler = currentEffects[actionType];
    dispatch && dispatch(handler(payload), storeKey);
  });
});

const padding = (value, paddingCount = 2) => `00${value}`.slice(-paddingCount);

const formatTime = d => {
  const date = new Date(d);
  const hh = date.getHours();
  const mm = date.getMinutes();
  const ss = date.getSeconds();
  const ms = date.getMilliseconds();
  return `${padding(hh)}:${padding(mm)}:${padding(ss)}.${padding(ms, 3)}`;
};

const colorLine =
/*#__PURE__*/
Function.apply.bind(console.log, null); // eslint-disable-line

const colorGroupEnd = console.groupEnd; // eslint-disable-line

const colorGroupCollapsed =
/*#__PURE__*/
Function.apply.bind(console.groupCollapsed, null); // eslint-disable-line
// const isEmptyObject = obj => !obj || Object.keys(obj).length === 0 && obj.constructor === Object

const colorLog = group => {
  const {
    text: t,
    styles: s
  } = group.reduce((acc, cur) => {
    const {
      text,
      styles
    } = acc;
    const [subText, subStyle] = cur;
    return {
      text: `${text}%c ${subText}`,
      styles: [].concat(styles, subStyle)
    };
  }, {
    text: '',
    styles: []
  });
  return [t, ...s];
};

const renderTitle = props => {
  const {
    initialActions,
    startTime,
    endTime
  } = props;
  let title = '';
  const nextActions = [].concat(initialActions).slice(0, 2);
  nextActions.forEach(({
    type
  }) => {
    title = title ? `${title}__${type}` : type;
  });

  if (initialActions.length > 2) {
    title = `${title}...`;
  }

  let actionColor = 'color: #7cb305; font-weight: bold';

  if (title.startsWith('@init')) {
    actionColor = 'color: #ff4d4f; font-weight: bold';
  }

  const parts = [];
  parts.push(['action', actionColor]);
  parts.push([title, 'color: inherit;']);
  parts.push([`@ ${formatTime(startTime)}`, 'color: gray; font-weight: lighter;']);
  parts.push([`(${endTime - startTime}ms)`, 'color: gray; font-weight: lighter;']);
  colorGroupCollapsed(colorLog(parts));
};

const renderSubAction = props => {
  const {
    type,
    payload = '',
    actionType = 'action',
    style
  } = props;
  const parts = [];

  if (type) {
    parts.push([actionType, 'color: #eb2f96; font-weight: bold']);
    parts.push([type, 'color: #722ed1; font-weight: bold']);
  }

  if (style === 'line') {
    colorLine([...colorLog(parts), payload]);
  } else {
    colorGroupCollapsed([...colorLog(parts), payload]);
  }
};

const renderState = (state, isNextState = false) => {
  const parts = [];
  let title = 'currentState';
  let style = 'color: #4CAF50; font-weight: bold';

  if (isNextState) {
    title = 'nextState';
    style = 'color: #4CAF50; font-weight: bold';
  }

  parts.push([title, style]);
  colorLine([...colorLog(parts), state]);
};

const renderPrevState = state => {
  renderState(state);
};

const paint = tree => {
  const {
    type,
    actions = {},
    effects = {},
    payload,
    actionType
  } = tree;
  const actionKeys = Object.keys(actions);
  const effectKeys = Object.keys(effects);

  if (!actionKeys.length && !effectKeys.length) {
    renderSubAction({
      type,
      payload,
      actionType,
      style: 'line'
    });
  } else {
    renderSubAction({
      type,
      payload,
      actionType
    });
  }

  actionKeys.forEach(key => {
    const action = actions[key];
    paint(action);
  });
  effectKeys.forEach(key => {
    const effect = effects[key];
    paint(effect);
  });

  if (actionKeys.length || effectKeys.length) {
    colorGroupEnd();
  }
};

const paintActions = actions => {
  const nextActions = actions.filter(({
    type
  }) => !type.startsWith('@init'));
  nextActions.forEach(action => paint(action));

  if (nextActions.length) {
    colorGroupEnd();
  }
};

var print = (props => {
  const {
    prevState = {},
    actions
  } = props;
  renderTitle(props);
  renderPrevState(prevState);
  paintActions(actions);
  colorGroupEnd();
});

var index = (({
  getState
}) => next => actions => {
  if (typeof actions !== 'function') {
    const startTime = Date.now();
    const prevState = JSON.parse(JSON.stringify(getState()));
    next(actions);
    const endTime = Date.now();
    print({
      actions,
      prevState,
      initialActions: actions,
      startTime,
      endTime
    });
  }
}); // 结束的时间点。。。
// 如果同步的reducers的话，最外层运行结束就是一个结点
// 如果说是一个effect的话，这个时候会有很多的不确定性。或者同样是以外层结束作为一个结点；
// 然后每一次有sub结束完就搞一次；最终的结论就是一个action可能会有多个的log

class Patcher {
  constructor({
    paths,
    autoRunFn,
    key,
    parent,
    displayName
  }) {
    this.autoRunFn = autoRunFn;
    this.paths = paths;
    this.removers = [];
    this.dirty = false;
    this.id = key;
    this.displayName = displayName;
    this.parent = parent;
    this.children = [];

    if (this.parent) {
      this.parent.children.push(this);
    }
  }

  destroyPatcher() {
    this.teardown();

    if (this.children.length) {
      this.children.forEach(child => child.destroyPatcher());
    }

    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.parent = null;
  }

  appendTo(parent) {
    if (this.parent) {
      this.parent.removeChild(this);
    }

    if (parent) {
      this.parent = parent;

      if (parent.children.indexOf(this) === -1) {
        parent.children.push(this);
      }
    }
  }

  belongs(parent) {
    if (!parent) return false;

    if (this.parent) {
      if (this.parent === parent) {
        return true;
      }

      return this.parent.belongs(parent);
    }

    return false;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) this.children.splice(index, 1);
  }

  update({
    paths
  }) {
    this.paths = paths;
    this.dirty = false;
    this.teardown();
  }

  addRemover(remover) {
    this.removers.push(remover);
  } // 将patcher从PathNode上删除


  teardown() {
    this.removers.forEach(remover => remover());
    this.removers = [];
  }

  markDirty() {
    this.teardown();
  }

  markDirtyAll() {
    this.teardown(); // If parent is dirty, then its children should be all dirty...

    if (this.children.length) {
      this.children.forEach(child => child.markDirtyAll());
    }
  }

  triggerAutoRun() {
    if (typeof this.autoRunFn === 'function') this.autoRunFn();
  }

}

let count = 0;

const Helper = ({
  addListener
}) => {
  addListener();
  return null;
};

var observe = (WrappedComponent => {
  function NextComponent(props) {
    const shadowState = useRef(0); // @ts-ignore

    const [_, setState] = useState(0); // eslint-disable-line

    const patcherUpdated = useRef(0);
    const isMounted = useRef(false);
    useEffect(() => {
      isMounted.current = true;
    });
    const {
      application,
      useProxy,
      useScope,
      namespace,
      patcher: parentPatcher,
      useRelinkMode,
      ...rest
    } = useContext(context);
    const incrementCount = useRef(count++); // eslint-disable-line

    const componentName = `${NextComponent.displayName}-${incrementCount.current}`;
    const patcher = useRef();
    shadowState.current += 1;

    const autoRunFn = () => {
      if (isMounted.current) setState(state => state + 1);
    };

    if (!patcher.current) {
      patcher.current = new Patcher({
        paths: [],
        autoRunFn,
        parent: parentPatcher,
        key: generatePatcherKey({
          namespace: namespace,
          componentName
        }),
        displayName: NextComponent.displayName
      });
    }

    application === null || application === void 0 ? void 0 : application.proxyState.enter(componentName);
    useEffect(() => () => {
      if (patcher.current) patcher.current.destroyPatcher();
    }, [] // eslint-disable-line
    );
    const addListener = useCallback(() => {
      var _patcher$current, _patcher$current2;

      (_patcher$current = patcher.current) === null || _patcher$current === void 0 ? void 0 : _patcher$current.appendTo(parentPatcher); // maybe not needs
      // const paths = []
      // const start = Date.now();
      // const paths2 = application?.proxyState
      //   .getContext()
      //   .getCurrent()
      //   .getRemarkable();
      // const end = Date.now();
      // console.log('diff ', componentName, end - start, paths2);
      // @ts-ignore

      const paths = application === null || application === void 0 ? void 0 : application.proxyState.getContext().getCurrent().getRemarkable(); // const end2 = Date.now();
      // console.log('diff ', componentName, end2 - end, paths);

      (_patcher$current2 = patcher.current) === null || _patcher$current2 === void 0 ? void 0 : _patcher$current2.update({
        paths
      });
      if (patcher.current) application === null || application === void 0 ? void 0 : application.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      application === null || application === void 0 ? void 0 : application.proxyState.leave(componentName);
    }, []); // eslint-disable-line

    const contextValue = { ...rest,
      application,
      useProxy,
      useScope,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      componentName: componentName
    };
    return React.createElement(context.Provider, {
      value: contextValue
    }, React.createElement(React.Fragment, null, React.createElement(WrappedComponent, Object.assign({}, props)), React.createElement(Helper, {
      addListener: addListener
    })));
  }

  NextComponent.displayName = WrappedComponent.displayName || WrappedComponent.name || 'ObservedComponent';
  return React.memo(props => React.createElement(NextComponent, Object.assign({}, props)));
});

export { Provider, applyMiddleware, createStore, index as logger, observe, thunk, useDispatch, useGlobal, useNamespace, useRelinx };
//# sourceMappingURL=relinx.esm.js.map
