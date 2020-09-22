'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var invariant = _interopDefault(require('invariant'));

const calculateChangeBits = () => 0b00;

const noop = () => {};

const defaultValue = {
  computation: null,
  getData: () => ({
    trackerNode: null
  }),
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
React.createContext(defaultValue, // @ts-ignore
calculateChangeBits);

/**
 * Intentional info-level logging for clear separation from ad-hoc console debug logging.
 */
function infoLog(...args) {
  console.log('**DEBUG**', ...args); // eslint-disable-line
}

class PathNode {
  constructor(prop, parent) {
    this.prop = prop || 'root';
    this.parent = parent;
    this.children = {};
    this.patchers = [];
  }

  addPathNode(path, patcher) {
    const len = path.length;
    path.reduce((node, cur, index) => {
      // path中前面的值都是为了让我们定位到最后的需要关心的位置
      if (!node.children[cur]) node.children[cur] = new PathNode(cur, node); // 只有到达`path`的最后一个`prop`时，才会进行patcher的添加

      if (index === len - 1) {
        const childNode = node.children[cur];

        childNode.patchers.push(patcher);
        patcher.addRemover(() => {
          const index = childNode.patchers.indexOf(patcher);

          if (index !== -1) {
            childNode.patchers.splice(index, 1);
          }
        });
      }

      return node.children[cur];
    }, this);
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

function is(x, y) {
  // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }

  return x !== x && y !== y; // eslint-disable-line
}

const toString =
/*#__PURE__*/
Function.call.bind(Object.prototype.toString);

const isObject = obj => toString(obj) === '[object Object]';
const isArray = obj => toString(obj) === '[object Array]';
const isMutable = obj => isObject(obj) || isArray(obj);
const isTypeEqual = (o1, o2) => toString(o1) === toString(o2);

function diffArraySimple(a = [], b) {
  const parts = [];

  for (let i = 0; i < a.length; i++) {
    const key = a[i];

    if (b.indexOf(key) === -1) {
      parts.push(key);
    }
  }

  return parts;
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
  }

  update(values) {
    this.pendingPatchers = [];

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

    if (this.pendingPatchers.length) {
      // const patcherId = generatePatcherId({ namespace: this.namespace });
      this.pendingPatchers.forEach(({
        patcher
      }) => {
        patcher.triggerAutoRun();
      });
    }
  }

  updateBase({
    storeKey,
    changedValue
  }) {
    const origin = this.base[storeKey] || {};
    this.base[storeKey] = { ...origin,
      ...changedValue
    };
  }

  treeShake({
    storeKey,
    changedValue
  }) {
    const branch = this.node.children[storeKey];
    const baseValue = this.base[storeKey];
    const rootBaseValue = baseValue;
    const nextValue = { ...baseValue,
      ...changedValue
    }; // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4

    if (!branch) return;
    const toDestroy = [];

    const compare = (branch, baseValue, nextValue, collections, operation) => {
      if (is(baseValue, nextValue)) return; // TODO, add description...only primitive type react...

      if (!isTypeEqual(baseValue, nextValue) || !isMutable(nextValue)) {
        if (branch.patchers.length) {
          branch.patchers.forEach(patcher => {
            this.pendingPatchers.push({
              collections,
              patcher,
              operation
            });
          }); // delete should be placed after collection...
          // `branch.patchers` will be modified on `markDirty`..
          // branch.patchers.forEach(patcher => patcher.markDirtyAll())

          branch.patchers.forEach(patcher => patcher.markDirty());
        }
      }

      const caredKeys = Object.keys(branch.children);
      let keysToCompare = caredKeys;
      let keysToDestroy = [];
      const currentOperation = []; // 处理，如果说array中的一项被删除了。。。。

      if (isTypeEqual(baseValue, nextValue) && Array.isArray(nextValue)) {
        const baseLength = baseValue.length;
        const nextLength = nextValue.length;

        if (nextLength < baseLength) {
          keysToCompare = caredKeys.filter(key => parseInt(key, 10) < nextLength || key === 'length');
          keysToDestroy = caredKeys.filter(key => {
            if (parseInt(key, 10) >= nextLength) {
              currentOperation.push({
                path: collections.concat(key),
                isDelete: true
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
          toDestroy.push(((branch, removed) => {
            removed.forEach(key => {
              const childBranch = branch.children[key];
              if (childBranch) childBranch.destroyPathNode();
            });
          }).bind(null, branch, removed));
        }
      }

      if (this.strictMode) {
        keysToCompare.forEach(key => {
          const childBranch = branch.children[key];

          if (!baseValue || typeof baseValue[key] === 'undefined') {
            childBranch.patchers.forEach(patcher => {
              const displayName = patcher.displayName;
              const joinedPath = collections.concat(key).join('.');
              console.warn('root base value ', rootBaseValue); // eslint-disable-line

              console.warn( // eslint-disable-line
              `Maybe you are using an un-declared props %c${joinedPath}` + ` %cin Component %c${displayName} %cYou'd better declare this prop in model first,` + 'or component may not re-render when value changes on ES5.', 'color: #ff4d4f; font-weight: bold', '', 'color: #7cb305; font-weight: bold', '');
            });
          }
        });
      }

      keysToCompare.forEach(key => {
        const childBranch = branch.children[key];
        const childBaseValue = baseValue ? baseValue[key] : undefined; // 当一个对象中的key被删除的时候，那么它的值就是undefined

        const childNextValue = nextValue ? nextValue[key] : undefined;
        compare(childBranch, childBaseValue, childNextValue, collections.concat(key), currentOperation);
      });

      if (keysToDestroy.length) {
        toDestroy.push(((branch, keysToDestroy) => {
          keysToDestroy.forEach(key => {
            const childBranch = branch.children[key];
            if (childBranch) childBranch.destroyPathNode();
          });
        }).bind(null, branch, keysToDestroy));
      }
    };

    compare(branch, baseValue, nextValue, [storeKey], []);
    toDestroy.forEach(fn => fn());
  }

  addPatcher(patcher) {
    const paths = patcher.paths;
    paths.forEach(fullPath => {
      this.node.addPathNode(fullPath, patcher);
    });
  }

  getStoreData(storeName) {
    const storeValue = this.base[storeName]; // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
    // invariant(
    //   !!storeValue,
    //   `Invalid storeName '${storeName}'.` +
    //     'Please ensure `base[storeName]` return non-undefined value '
    // );

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
  const namespaceRef = React.useRef(namespace || generateNamespaceKey());
  const application = React.useRef(new Application({
    base: store.getState(),
    namespace: namespaceRef.current,
    strictMode
  }));
  store.bindApplication(application.current);
  const dispatch = store.dispatch;
  const contextValue = React.useRef({ ...defaultValue,
    dispatch,
    useProxy,
    useScope,
    useRelinkMode,
    namespace: namespaceRef.current,
    application: application.current
  });
  return React__default.createElement(context.Provider, {
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
      const [storeKey, actionType] = type.split('/');
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
    getData,
    attachStoreName
  } = React.useContext(context);
  !(typeof storeName === 'string' && storeName !== '') ?  invariant(false, '`storeName` is required')  : void 0;
  !!!getData ?  invariant(false, `'useRelinx' should be wrapper in observe function`)  : void 0;
  attachStoreName(storeName);
  const {
    trackerNode
  } = getData();
  !!!trackerNode.proxy ?  invariant(false, `[useRelinx]: 'getData' fails`)  : void 0;
  return [trackerNode.proxy, dispatch];
});

var useDispatch = (() => {
  const {
    dispatch
  } = React.useContext(context);
  return [dispatch];
});

var useNamespace = (() => {
  const {
    namespace
  } = React.useContext(context);
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
    !targetNamespace ?  invariant(false, '`namespace` is required for global action')  : void 0;
    !actions ?  invariant(false, '`actions` is required for global action')  : void 0;
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

const toString$1 =
/*#__PURE__*/
Function.call.bind(Object.prototype.toString);

const ownKeys = o => typeof Reflect !== 'undefined' && Reflect.ownKeys ? Reflect.ownKeys(o) : typeof Object.getOwnPropertySymbols !== 'undefined' ? Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o)) : Object.getOwnPropertyNames(o);
const isObject$1 = o => o ? typeof o === 'object' || typeof o === 'function' : false; // eslint-disable-line

const hasSymbol = typeof Symbol !== 'undefined';
const TRACKER = hasSymbol ?
/*#__PURE__*/
Symbol('tracker') : '__tracker__';
const canIUseProxy = () => {
  try {
    new Proxy({}, {}); // eslint-disable-line
  } catch (err) {
    return false;
  }

  return true;
};
const hasOwnProperty = (o, prop) => o.hasOwnProperty(prop); // eslint-disable-line

const isTrackable = o => {
  return ['[object Object]', '[object Array]'].indexOf(toString$1(o)) !== -1;
};
function each(obj, iter) {
  if (Array.isArray(obj)) {
    obj.forEach((entry, index) => iter(index, entry, obj));
  } else if (isObject$1(obj)) {
    // @ts-ignore
    ownKeys(obj).forEach(key => iter(key, obj[key], obj));
  }
}
const Type = {
  Object: 'object',
  Array: 'array'
};
function shallowCopy(o) {
  if (Array.isArray(o)) return o.slice();
  const value = Object.create(Object.getPrototypeOf(o));
  ownKeys(o).forEach(key => {
    value[key] = o[key];
  });
  return value;
}
const inherit = (subClass, superClass) => {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass; // subClass.__proto__ = superClass // eslint-disable-line
};
const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true
  });
};
const hideProperty = (target, prop) => {
  Object.defineProperty(target, prop, {
    enumerable: false,
    configurable: false
  });
};

const context$1 = {
  trackerNode: null
};

const joinPath = path => path.join('_');

const generateRemarkablePaths = paths => {
  const copy = paths.slice();
  const accessMap = {};
  const len = copy.length;
  const remarkablePaths = [];

  for (let i = len - 1; i >= 0; i--) {
    const path = copy[i].slice();
    const pathLength = path.length;
    let isConsecutive = false;

    for (let i = 0; i < pathLength; i++) {
      const joinedPath = joinPath(path);
      const count = accessMap[joinedPath] || 0; // the intermediate accessed path will be ignored.
      // https://stackoverflow.com/questions/2937120/how-to-get-javascript-object-references-or-reference-count
      // because of this, intermediate value may be ignored...

      if (isConsecutive) {
        accessMap[joinedPath] = count + 1;
        path.pop();
        continue; // eslint-disable-line
      }

      if (!count) {
        const p = path.slice();
        const str = joinPath(p);
        const found = remarkablePaths.find(path => joinPath(path) === str);
        if (!found) remarkablePaths.push(p);
        isConsecutive = true;
        path.pop();
      } else {
        accessMap[joinedPath] = count - 1;
        break;
      }
    }
  }

  return remarkablePaths;
};

const peek = (proxy, accessPath) => {
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true);
    const nextProxy = proxy[cur];
    proxy.setProp('isPeeking', false);
    return nextProxy;
  }, proxy);
};

function internalFunctions() {}

const proto = internalFunctions.prototype;

proto.assertLink = function (fnName) {
  const proxy = this;
  const trackerNode = proxy.getProp('trackerNode');
  !trackerNode ?  invariant(false, `You should not use \`${fnName}\` method with pure \`proxy\` object.\n` + 'which should be bind with an `trackerNode` object')  : void 0;
  !(context$1.trackerNode !== trackerNode) ?  invariant(false, `\`${fnName}\` method is used to update \`proxy\` object from upstream.\n` + 'So it is not meaning to link proxy in current trackerNode scope')  : void 0;
};

proto.reportAccessPath = function (path) {
  const proxy = this; // eslint-disable-line

  const paths = proxy.getProp('paths');
  const parentProxy = proxy.getProp('parentProxy');
  paths.push(path);
  if (!parentProxy) return;
  parentProxy.runFn('reportAccessPath', path);
};

proto.cleanup = function () {
  const proxy = this; // eslint-disable-line

  proxy.setProp('paths', []);
  proxy.setProp('propProperties', []);
};

proto.unlink = function () {
  const proxy = this; // eslint-disable-line

  return proxy.getProp('base');
};

proto.relink = function (path, baseValue) {
  try {
    this.runFn('assertLink', 'relink');
    const proxy = this; // eslint-disable-line

    let copy = path.slice();
    let last = copy.pop();
    const len = path.length;
    let nextBaseValue = baseValue; // fix: {a: { b: 1 }} => {a: {}}, nextBaseValue[key] is undefined

    for (let i = 0; i < len; i++) {
      const key = path[i];

      if (typeof nextBaseValue[key] !== 'undefined') {
        nextBaseValue = nextBaseValue[key];
      } else {
        copy = path.slice(0, i - 1);
        last = path[i - 1];
        break;
      }
    }

    const nextProxy = peek(proxy, copy);
    nextProxy.relinkProp(last, nextBaseValue);
  } catch (err) {// infoLog('[proxy relink issue]', path, baseValue, err)
  }
};

proto.relinkProp = function (prop, newValue) {
  this.runFn('assertLink', 'relinkProp');
  const proxy = this; // eslint-disable-line

  const base = proxy.getProp('base');
  const childProxies = proxy.getProp('childProxies');
  const accessPath = proxy.getProp('accessPath');

  if (Array.isArray(base)) {
    proxy.setProp('base', base.filter(v => v));
  }

  proxy.getProp('base')[prop] = newValue;

  if (isTrackable(newValue)) {
    childProxies[prop] = proxy.createChild(newValue, {
      accessPath: accessPath.concat(prop),
      parentProxy: proxy
    });
  }
};

proto.relinkBase = function (baseValue) {
  this.runFn('assertLink', 'rebase');
  this.runFn('rebase', baseValue);
};

proto.rebase = function (baseValue) {
  try {
    const proxy = this; // eslint-disable-line

    proxy.setProp('base', baseValue);
  } catch (err) {// infoLog('[proxy] rebase ', err)
  }
};

proto.setRemarkable = function () {
  const proxy = this; // eslint-disable-line

  const accessPath = proxy.getProp('accessPath');
  const parentProxy = proxy.getProp('parentProxy');
  if (!parentProxy) return false;
  parentProxy.runFn('reportAccessPath', accessPath);
  return true;
};

proto.getRemarkableFullPaths = function () {
  const proxy = this; // eslint-disable-line

  const paths = proxy.getProp('paths');
  const propProperties = proxy.getProp('propProperties');
  const rootPath = proxy.getProp('rootPath');
  const internalPaths = generateRemarkablePaths(paths).map(path => rootPath.concat(path));
  const external = propProperties.map(prop => {
    const {
      path,
      source
    } = prop;
    const sourceRootPath = source === null || source === void 0 ? void 0 : source.getProp('rootPath');
    return sourceRootPath.concat(path);
  });
  const externalPaths = generateRemarkablePaths(external);
  return internalPaths.concat(externalPaths);
};

proto.assertScope = function () {
  const useScope = this.getProp('useScope');
  if (!useScope) return;
  const trackerNode = this.getProp('trackerNode'); // If `contextTrackerNode` is null, it means access top most data prop.

  if (!trackerNode) {
    console.warn('trackerNode is undefined, which means you are using createTracker function directly.' + 'Maybe you should create TrackerNode object.');
  } else if (!trackerNode.contains(context$1.trackerNode) && context$1.trackerNode) throw new Error(trackerNode.id + 'is not child node of ' + context$1.trackerNode.id + 'Property only could be accessed by self node or parent node.');
};

hideProperty(proto, 'assertLink');
hideProperty(proto, 'reportAccessPath');
hideProperty(proto, 'cleanup');
hideProperty(proto, 'unlink');
hideProperty(proto, 'relink');
hideProperty(proto, 'relinkBase');
hideProperty(proto, 'relinkProp');
hideProperty(proto, 'setRemarkable');
hideProperty(proto, 'getRemarkableFullPaths');
hideProperty(proto, 'rebase');
hideProperty(proto, 'assertScope');

let count = 0;

const ES5Tracker = function ({
  accessPath,
  parentProxy,
  rootPath,
  base,
  trackerNode,
  useRevoke,
  useScope
}) {
  createHiddenProperty(this, 'id', `ES5Tracker_${count++}`); // eslint-disable-line

  createHiddenProperty(this, 'trackerNode', trackerNode);
  createHiddenProperty(this, 'accessPath', accessPath);
  createHiddenProperty(this, 'rootPath', rootPath);
  createHiddenProperty(this, 'type', Array.isArray(base) ? Type.Array : Type.Object);
  createHiddenProperty(this, 'base', base);
  createHiddenProperty(this, 'parentProxy', parentProxy);
  createHiddenProperty(this, 'childProxies', {});
  createHiddenProperty(this, 'isPeeking', false);
  createHiddenProperty(this, 'propProperties', []);
  createHiddenProperty(this, 'paths', []);
  createHiddenProperty(this, 'useRevoke', useRevoke);
  createHiddenProperty(this, 'useScope', useScope);
  createHiddenProperty(this, 'isRevoked', false);
  createHiddenProperty(this, 'assertRevoke', function () {
    const useRevoke = this.getProp('useRevoke');
    if (!useRevoke) return;
    const isRevoked = this.getProp('isRevoked');

    if (isRevoked) {
      throw new Error('Cannot use a proxy that has been revoked. Did you pass an object ' + 'to an async process? ');
    }
  });
};

inherit(ES5Tracker, internalFunctions);

const peek$1 = (proxy, accessPath) => {
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true);
    const nextProxy = proxy[cur];
    proxy.setProp('isPeeking', false);
    return nextProxy;
  }, proxy);
};

function createES5Tracker(target, config, trackerNode) {
  const {
    accessPath = [],
    parentProxy,
    useRevoke,
    useScope,
    rootPath = []
  } = config || {};

  if (!isObject$1(target)) {
    throw new TypeError('Cannot create proxy with a non-object as target or handler');
  }

  const proxy = shallowCopy(target);

  function proxyProperty(proxy, prop, enumerable) {
    const desc = {
      enumerable,
      configurable: false,

      get() {
        this.runFn('assertRevoke');
        this.runFn('assertScope');
        const base = this.getProp('base');
        const accessPath = this.getProp('accessPath');
        const childProxies = this.getProp('childProxies');
        const isPeeking = this.getProp('isPeeking');
        const value = base[prop]; // For es5, the prop in array index getter is integer; when use proxy,
        // `prop` will be string.

        const nextAccessPath = accessPath.concat(`${prop}`);

        if (!isPeeking) {
          // for relink return parent prop...
          if (context$1.trackerNode && trackerNode.id !== context$1.trackerNode.id) {
            const contextProxy = context$1.trackerNode.proxy;
            const propProperties = contextProxy === null || contextProxy === void 0 ? void 0 : contextProxy.getProp('propProperties');
            propProperties.push({
              path: nextAccessPath,
              source: trackerNode.proxy
            });
            this.setProp('propProperties', propProperties);
            if (trackerNode.proxy) return peek$1(trackerNode.proxy, nextAccessPath);
          }

          this.runFn('reportAccessPath', nextAccessPath);
        }

        if (!isTrackable(value)) return value;
        const childProxy = childProxies[prop]; // for rebase value, if base value change, the childProxy should
        // be replaced

        if (childProxy && childProxy.base === value) {
          return childProxy;
        }

        return childProxies[prop] = createES5Tracker(value, {
          accessPath: nextAccessPath,
          parentProxy: proxy,
          rootPath,
          useRevoke,
          useScope
        }, trackerNode);
      }

    };
    Object.defineProperty(proxy, prop, desc);
  }

  each(target, prop => {
    const desc = Object.getOwnPropertyDescriptor(target, prop);
    const enumerable = (desc === null || desc === void 0 ? void 0 : desc.enumerable) || false;
    proxyProperty(proxy, prop, enumerable);
  });

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([]);
    const keys = Object.getOwnPropertyNames(descriptors);

    const handler = (func, functionContext, lengthGetter = true) => function () {
      const args = Array.prototype.slice.call(arguments); // eslint-disable-line

      this.runFn('assertRevoke');

      if (lengthGetter) {
        const accessPath = this.getProp('accessPath');
        const isPeeking = this.getProp('isPeeking');
        const nextAccessPath = accessPath.concat('length');

        if (!isPeeking) {
          if (context$1.trackerNode && trackerNode.id !== context$1.trackerNode.id) {
            const contextProxy = context$1.trackerNode.proxy;
            const propProperties = contextProxy === null || contextProxy === void 0 ? void 0 : contextProxy.getProp('propProperties');
            propProperties.push({
              path: nextAccessPath,
              source: trackerNode.proxy
            });
            this.setProp('propProperties', propProperties);
          }

          this.runFn('reportAccessPath', nextAccessPath);
        }
      }

      return func.apply(functionContext, args);
    };

    keys.forEach(key => {
      const func = descriptors[key];

      if (typeof func === 'function') {
        const notRemarkLengthPropKeys = ['concat', 'copyWith'];
        const remarkLengthPropKeys = ['concat', 'copyWith', 'fill', 'find', 'findIndex', 'lastIndexOf', 'pop', 'push', 'reverse', 'shift', 'unshift', 'slice', 'sort', 'splice', 'includes', 'indexOf', 'join', 'keys', 'entries', 'forEach', 'filter', 'flat', 'flatMap', 'map', 'every', 'some', 'reduce', 'reduceRight'];

        if (notRemarkLengthPropKeys.indexOf(key) !== -1) {
          createHiddenProperty(proxy, key, handler(func, proxy, false));
        } else if (remarkLengthPropKeys.indexOf(key) !== -1) {
          createHiddenProperty(proxy, key, handler(func, proxy));
        }
      }
    });
  }

  const tracker = new ES5Tracker({
    base: target,
    parentProxy,
    accessPath,
    rootPath,
    trackerNode,
    useRevoke,
    useScope
  });
  createHiddenProperty(proxy, 'getProps', function () {
    const args = Array.prototype.slice.call(arguments);
    return args.map(prop => this[TRACKER][prop]);
  });
  createHiddenProperty(proxy, 'getProp', function () {
    const args = Array.prototype.slice.call(arguments);
    return this[TRACKER][args[0]];
  });
  createHiddenProperty(proxy, 'setProp', function () {
    const args = Array.prototype.slice.call(arguments);
    const prop = args[0];
    const value = args[1]; // @ts-ignore

    return this[TRACKER][prop] = value;
  });
  createHiddenProperty(proxy, 'runFn', function () {
    const args = Array.prototype.slice.call(arguments);
    const fn = this[TRACKER][args[0]];
    const rest = args.slice(1);
    if (typeof fn === 'function') return fn.apply(this, rest);
  });
  createHiddenProperty(proxy, 'unlink', function () {
    return this.runFn('unlink');
  });
  createHiddenProperty(proxy, 'createChild', function () {
    const args = Array.prototype.slice.call(arguments);
    const target = args[0] || {};
    const config = args[1] || {};
    return createES5Tracker(target, {
      useRevoke,
      useScope,
      rootPath,
      ...config
    }, trackerNode);
  });
  createHiddenProperty(proxy, 'revoke', function () {
    const useRevoke = this.getProp('useRevoke');
    if (useRevoke) this.setProp('isRevoked', true);
  });
  createHiddenProperty(proxy, TRACKER, tracker);
  return proxy;
}

var Type$1;

(function (Type) {
  Type["Object"] = "object";
  Type["Array"] = "array";
})(Type$1 || (Type$1 = {}));

let count$1 = 0; // 'this' implicitly has type 'any'
// https://stackoverflow.com/questions/52431074/how-to-solve-this-implicitly-has-type-any-when-typescript-checking-classic

const ProxyTracker = function ({
  accessPath,
  parentProxy,
  rootPath,
  base,
  trackerNode,
  useRevoke,
  useScope
}) {
  createHiddenProperty(this, 'id', `ProxyTracker_${count$1++}`); // eslint-disable-line

  createHiddenProperty(this, 'trackerNode', trackerNode);
  createHiddenProperty(this, 'accessPath', accessPath);
  createHiddenProperty(this, 'rootPath', rootPath);
  createHiddenProperty(this, 'type', Array.isArray(base) ? Type$1.Array : Type$1.Object);
  createHiddenProperty(this, 'base', base);
  createHiddenProperty(this, 'parentProxy', parentProxy);
  createHiddenProperty(this, 'childProxies', {});
  createHiddenProperty(this, 'isPeeking', false);
  createHiddenProperty(this, 'propProperties', []);
  createHiddenProperty(this, 'paths', []);
  createHiddenProperty(this, 'useRevoke', useRevoke);
  createHiddenProperty(this, 'useScope', useScope); // function constructor https://stackoverflow.com/a/43624326/2006805
};

inherit(ProxyTracker, internalFunctions);

const peek$2 = (proxy, accessPath) => {
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true);
    const nextProxy = proxy[cur];
    proxy.setProp('isPeeking', false);
    return nextProxy;
  }, proxy);
};

function createTracker(target, config, trackerNode) {
  const {
    accessPath = [],
    parentProxy,
    useRevoke,
    useScope,
    rootPath = []
  } = config || {};

  if (!isObject$1(target)) {
    throw new TypeError('Cannot create proxy with a non-object as target or handler');
  }

  const copy = shallowCopy(target);
  const internalProps = [TRACKER, 'revoke', 'runFn', 'unlink', 'getProp', 'setProp', 'getProps', 'createChild']; // can not use this in handler, should be `target`

  const handler = {
    get: (target, prop, receiver) => {
      target.runFn('assertScope');
      if (prop === TRACKER) return Reflect.get(target, prop, receiver); // assertScope(trackerNode, context.trackerNode)

      const base = target.getProp('base'); // refer to immer...
      // if (Array.isArray(tracker)) target = tracker[0]

      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1;

      if (isInternalPropAccessed || !hasOwnProperty(base, prop)) {
        return Reflect.get(target, prop, receiver);
      }

      const accessPath = target.getProp('accessPath');
      const nextAccessPath = accessPath.concat(prop);
      const isPeeking = target.getProp('isPeeking');

      if (!isPeeking) {
        // for relink return parent prop...
        if (context$1.trackerNode && trackerNode.id !== context$1.trackerNode.id) {
          const contextProxy = context$1.trackerNode.proxy;
          const propProperties = contextProxy === null || contextProxy === void 0 ? void 0 : contextProxy.getProp('propProperties');
          propProperties.push({
            path: nextAccessPath,
            source: trackerNode.proxy
          });
          target.setProp('propProperties', propProperties);
          if (trackerNode.proxy) return peek$2(trackerNode.proxy, nextAccessPath);
        }

        target.runFn('reportAccessPath', nextAccessPath);
      }

      const childProxies = target.getProp('childProxies');
      const value = base[prop];
      if (!isTrackable(value)) return value;
      const childProxy = childProxies[prop]; // for rebase value, if base value change, the childProxy should
      // be replaced

      if (childProxy && childProxy.base === value) {
        return childProxy;
      }

      return childProxies[prop] = createTracker(value, {
        accessPath: nextAccessPath,
        parentProxy: target,
        rootPath,
        useRevoke,
        useScope
      }, trackerNode);
    }
  };
  const tracker = new ProxyTracker({
    base: target,
    parentProxy,
    accessPath,
    rootPath,
    trackerNode,
    useRevoke,
    useScope
  });
  const {
    proxy,
    revoke
  } = Proxy.revocable(copy, handler);
  createHiddenProperty(proxy, 'getProps', function () {
    const args = Array.prototype.slice.call(arguments);
    return args.map(prop => this[TRACKER][prop]);
  });
  createHiddenProperty(proxy, 'getProp', function () {
    const args = Array.prototype.slice.call(arguments);
    return this[TRACKER][args[0]];
  });
  createHiddenProperty(proxy, 'setProp', function () {
    const args = Array.prototype.slice.call(arguments); // eslint-disable-line

    const prop = args[0];
    const value = args[1]; // this[TRACKER][prop as keyof ProxyTrackerInterface] = value
    // @ts-ignore

    return this[TRACKER][prop] = value;
  });
  createHiddenProperty(proxy, 'runFn', function () {
    const args = Array.prototype.slice.call(arguments); // eslint-disable-line

    const fn = this[TRACKER][args[0]];
    const rest = args.slice(1);
    if (typeof fn === 'function') return fn.apply(this, rest);
  });
  createHiddenProperty(proxy, 'unlink', function () {
    return this.runFn('unlink');
  });
  createHiddenProperty(proxy, 'createChild', function () {
    const args = Array.prototype.slice.call(arguments); // eslint-disable-line

    const target = args[0] || {};
    const config = args[1] || {};
    return createTracker(target, {
      useRevoke,
      useScope,
      rootPath,
      ...config
    }, trackerNode);
  });
  createHiddenProperty(proxy, 'revoke', function () {
    const useRevoke = this.getProp('useRevoke');
    if (useRevoke) revoke();
  });
  createHiddenProperty(proxy, TRACKER, tracker);
  return proxy;
}

let count$2 = 0;

class TrackerNode {
  constructor({
    parent,
    isSibling,
    base,
    useRevoke,
    useScope,
    useProxy,
    rootPath
  }) {
    this.base = base;
    this.useRevoke = useRevoke;
    this.useScope = useScope;
    this.useProxy = useProxy;
    this.rootPath = rootPath || [];
    this.children = [];
    this.parent = parent;
    this.prevSibling = null;
    this.nextSibling = null;
    this.proxy = null;
    this.id = `__TrackerNode_${count$2++}__`; // eslint-disable-line

    this.isRevoked = false;
    this.inScope = false;
    this.updateParent();

    if (isSibling) {
      this.initPrevSibling();
    }

    if (this.base) {
      this.enterTrackerScope();
    }
  }

  updateParent() {
    if (this.parent) {
      this.parent.children.push(this);
    }
  }

  enterTrackerScope() {
    this.enterContext();
    const fn = this.useProxy ? createTracker : createES5Tracker;
    this.proxy = fn(this.base, {
      useRevoke: this.useRevoke,
      useScope: this.useScope,
      rootPath: this.rootPath
    }, this);
  }

  enterContext() {
    context$1.trackerNode = this;
    this.inScope = true;
  }

  leaveContext() {
    if (this.inScope) {
      this.inScope = false;
      context$1.trackerNode = null;
    }

    if (this.parent && this.parent.inScope) {
      context$1.trackerNode = this.parent;
    }
  }

  initPrevSibling() {
    if (this.parent) {
      const childNodes = this.parent.children;
      const lastChild = childNodes[childNodes.length - 1];
      this.prevSibling = lastChild;

      if (lastChild) {
        lastChild.nextSibling = this;
      }
    }
  }

  destroy() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
    }

    const prev = this.prevSibling;
    const next = this.nextSibling;

    if (prev) {
      if (next) prev.nextSibling = next;else prev.nextSibling = null;
    }

    if (next) {
      if (prev) next.prevSibling = prev;else next.prevSibling = null;
    }
  }

  contains(childNode) {
    if (childNode === this) return true;
    if (!childNode) return false;
    const parent = childNode.parent;
    if (!parent) return false;
    if (parent === this) return true;
    return this.contains(parent);
  }

  revokeLastChild() {
    if (this.children.length) {
      this.children[this.children.length - 1].revoke();
    }
  }
  /**
   *
   * @param {null | TrackerNode} parent, null value means revoke until to top most.
   */


  revokeUntil(parent) {
    if (parent === this) return true;

    if (parent) {
      if (parent.isRevoked) throw new Error('Assign a `revoked` parent is forbidden');
    }

    if (this.parent) {
      // if (!parent) throw new Error('parent should exist')
      // the top most node, still can not find `parent` node
      // if (!this.parent) throw new Error('`parent` is not a valid `TrackerNode`')
      if (this.parent) {
        return this.parent.revokeUntil(parent);
      }
    }

    return this.revokeSelf();
  }

  revokeSelf() {
    if (this.children.length) {
      this.children.forEach(child => {
        if (!child.isRevoked) child.revokeSelf();
      });
    }

    if (!this.isRevoked) {
      var _this$proxy;

      (_this$proxy = this.proxy) === null || _this$proxy === void 0 ? void 0 : _this$proxy.revoke();
      this.isRevoked = true;
    }

    return true;
  }
  /**
   * return context handler to parent node.
   */


  revoke() {
    if (this.parent) {
      var _this$proxy2;

      (_this$proxy2 = this.proxy) === null || _this$proxy2 === void 0 ? void 0 : _this$proxy2.revoke();
      context$1.trackerNode = this.parent;
    }
  }

  hydrate(base, config = {}) {
    this.base = base || this.base;
    const keys = Object.keys(config || {}); // Object.keys always return 'string[]', So it need to
    // convert explicitly
    // https://stackoverflow.com/a/52856805/2006805

    keys.forEach(key => {
      // @ts-ignore
      this[key] = config[key];
    });
    this.enterTrackerScope();
  }

}

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */

const Tracker = ({
  base,
  parent,
  useProxy = true,
  useRevoke = false,
  useScope = true,
  rootPath = []
}) => {
  // const assertAccessibility = (useScope: boolean, useRevoke: boolean) => {
  //   invariant(
  //     useRevoke !== useScope,
  //     '`useRevoke` or `useScope` should not be equal; and one must be true. ' +
  //       'If you do not have any idea, please leave to use default value.'
  //   );
  // };
  // assertAccessibility(useScope, useRevoke);
  const verifiedUseProxy = canIUseProxy() && useProxy;
  const parentTrackerNode = typeof parent !== 'undefined' ? parent : context$1.trackerNode;
  let isSibling = false; // re-create a top most node

  if (!parentTrackerNode) {
    // start another top level branch...like
    // { a: { b: 1 }} => { a: { b: 1 }, c: {d: 2 }}
    if (context$1.trackerNode && useRevoke) {
      context$1.trackerNode.revokeUntil();
    }
  } else {
    if (parentTrackerNode === context$1.trackerNode) {
      // Add a child, for sibling, intersection access is forbidden.
      if (useRevoke) {
        parentTrackerNode.revokeLastChild();
      }
    } else if (useRevoke && context$1.trackerNode) {
      // Add a parentTrackerNode's sibling, so `revokeUntil` is required.
      context$1.trackerNode.revokeUntil(parentTrackerNode);
    }

    if (context$1.trackerNode && parentTrackerNode === context$1.trackerNode.parent) {
      isSibling = true;
    }
  }

  return new TrackerNode({
    parent: parentTrackerNode,
    isSibling,
    base,
    useRevoke,
    useScope,
    useProxy: verifiedUseProxy,
    rootPath
  });
};

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

let count$3 = 0;

const Helper = ({
  addListener
}) => {
  addListener();
  return null;
};
const unMountMap = {};

const diff = (componentName, patcher, proxy) => {
  const key1 = Object.keys(unMountMap);

  if (key1.indexOf(componentName) !== -1) {
    infoLog('invalid re-render', componentName, patcher, proxy);
  }
};

var observe = (WrappedComponent => {
  function NextComponent(props) {
    const shadowState = React.useRef(0); // @ts-ignore

    const [_, setState] = React.useState(0); // eslint-disable-line

    const storeName = React.useRef();
    const isHydrated = React.useRef(false);
    const isInit = React.useRef(true);
    const patcherUpdated = React.useRef(0);
    const {
      application,
      useProxy,
      useScope,
      namespace,
      patcher: parentPatcher,
      trackerNode: parentTrackerNode,
      useRelinkMode,
      ...rest
    } = React.useContext(context);
    const incrementCount = React.useRef(count$3++); // eslint-disable-line

    const componentName = `${NextComponent.displayName}-${incrementCount.current}`;
    const patcher = React.useRef();
    const trackerNode = React.useRef(null);
    shadowState.current += 1;

    const autoRunFn = () => {
      setState(state => state + 1);
      diff(componentName, patcher.current, trackerNode.current);
    };

    React.useEffect(() => {
      return;
    });

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

    if (!trackerNode.current) {
      // `base` should has a default value value `{}`, or it will cause error.
      // Detail refer to https://github.com/ryuever/relinx/issues/6
      trackerNode.current = Tracker({
        base: {},
        useProxy,
        useRevoke: false,
        useScope,
        parent: parentTrackerNode,
        rootPath: []
      });
    }

    if (trackerNode.current) {
      trackerNode.current.enterContext();
    } // destroy `patcher` when component un-mount.


    React.useEffect(() => () => {
      if (patcher.current) patcher.current.destroyPatcher();
      unMountMap[componentName] = patcher.current;
    }, [] // eslint-disable-line
    );
    const getData = React.useCallback(() => ({
      trackerNode: trackerNode.current || null
    }), []); // onUpdate, `relink` relative paths value....

    if (trackerNode.current.proxy) {
      const proxy = trackerNode.current.proxy; // 为什么如果进行remove的话，`propProperties`已经将旧key删除了呢。。。

      const propProperties = proxy.getProp('propProperties');
      propProperties.forEach(prop => {
        try {
          const {
            source
          } = prop;
          const rootPath = source === null || source === void 0 ? void 0 : source.getProp('rootPath');
          const storeName = rootPath[0];
          const currentBase = application === null || application === void 0 ? void 0 : application.getStoreData(storeName);
          source === null || source === void 0 ? void 0 : source.runFn('relinkBase', currentBase);
        } catch (err) {
          infoLog('[observe rebase propProperties]', err);
        }
      });

      if (useRelinkMode) {
        if (storeName.current) {
          const base = application === null || application === void 0 ? void 0 : application.getStoreData(storeName.current);
          proxy.runFn('rebase', base);
        }
      }

      trackerNode.current.proxy.runFn('cleanup');
    } // only run one time


    const attachStoreName = React.useCallback(name => {
      if (useRelinkMode) {
        if (name && !isHydrated.current) {
          var _trackerNode$current;

          storeName.current = name;
          const initialState = application === null || application === void 0 ? void 0 : application.getStoreData(storeName.current);
          (_trackerNode$current = trackerNode.current) === null || _trackerNode$current === void 0 ? void 0 : _trackerNode$current.hydrate(initialState, {
            rootPath: [storeName.current]
          });
          isHydrated.current = true;
        }
      } else {
        var _trackerNode$current2;

        storeName.current = name;
        const initialState = application === null || application === void 0 ? void 0 : application.getStoreData(storeName.current);
        (_trackerNode$current2 = trackerNode.current) === null || _trackerNode$current2 === void 0 ? void 0 : _trackerNode$current2.hydrate(initialState, {
          rootPath: [storeName.current]
        });
        isHydrated.current = true;
      }
    }, []); // eslint-disable-line

    const addListener = React.useCallback(() => {
      var _patcher$current, _trackerNode$current3, _patcher$current2;

      (_patcher$current = patcher.current) === null || _patcher$current === void 0 ? void 0 : _patcher$current.appendTo(parentPatcher); // maybe not needs

      if (!((_trackerNode$current3 = trackerNode.current) === null || _trackerNode$current3 === void 0 ? void 0 : _trackerNode$current3.proxy)) {
        if (trackerNode.current) trackerNode.current.leaveContext();
        return;
      }

      const paths = trackerNode.current.proxy.runFn('getRemarkableFullPaths');
      (_patcher$current2 = patcher.current) === null || _patcher$current2 === void 0 ? void 0 : _patcher$current2.update({
        paths
      });
      if (patcher.current) application === null || application === void 0 ? void 0 : application.addPatcher(patcher.current);
      patcherUpdated.current += 1;
      trackerNode.current.leaveContext();
    }, []); // eslint-disable-line

    const contextValue = { ...rest,
      getData,
      application,
      useProxy,
      useScope,
      namespace,
      useRelinkMode,
      patcher: patcher.current,
      trackerNode: trackerNode.current || null,
      attachStoreName
    };
    return React__default.createElement(context.Provider, {
      value: contextValue
    }, React__default.createElement(React__default.Fragment, null, React__default.createElement(WrappedComponent, Object.assign({}, props)), React__default.createElement(Helper, {
      addListener: addListener
    })));
  }

  NextComponent.displayName = WrappedComponent.displayName || WrappedComponent.name || 'ObservedComponent';
  return NextComponent; // return React.memo(props => <NextComponent {...props} />, () => true)
});

exports.Provider = Provider;
exports.applyMiddleware = applyMiddleware;
exports.createStore = createStore;
exports.logger = index;
exports.observe = observe;
exports.thunk = thunk;
exports.useDispatch = useDispatch;
exports.useGlobal = useGlobal;
exports.useNamespace = useNamespace;
exports.useRelinx = useRelinx;
//# sourceMappingURL=relinx.cjs.development.js.map
