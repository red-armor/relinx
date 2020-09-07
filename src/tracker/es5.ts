import {
  isObject,
  TRACKER,
  each,
  shallowCopy,
  isTrackable,
  createHiddenProperty,
} from './commons';
import ES5Tracker from './ES5Tracker';
import context from './context';
import {
  IES5Tracker,
  ES5TrackerInterface,
  ES5TrackerConfig,
  TrackerNode,
  PropProperty,
} from './types';

const peek = (proxy: IES5Tracker, accessPath: Array<string>) => { // eslint-disable-line
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true);
    const nextProxy = proxy[cur];
    proxy.setProp('isPeeking', false);
    return nextProxy;
  }, proxy);
};

function createES5Tracker(
  target: any,
  config: ES5TrackerConfig,
  trackerNode: TrackerNode
): IES5Tracker {
  const { accessPath = [], parentProxy, useRevoke, useScope, rootPath = [] } =
    config || {};

  if (!isObject(target)) {
    throw new TypeError(
      'Cannot create proxy with a non-object as target or handler'
    );
  }

  const proxy: IES5Tracker = shallowCopy(target);

  function proxyProperty(
    proxy: IES5Tracker,
    prop: PropertyKey,
    enumerable: boolean
  ) {
    const desc = {
      enumerable,
      configurable: false,
      get(this: IES5Tracker) {
        this.runFn('assertRevoke');
        this.runFn('assertScope');
        const base = this.getProp('base');
        const accessPath = this.getProp('accessPath');
        const childProxies = this.getProp('childProxies');
        const isPeeking = this.getProp('isPeeking');
        const value = base[prop];
        // For es5, the prop in array index getter is integer; when use proxy,
        // `prop` will be string.
        const nextAccessPath = accessPath.concat(`${prop as string}`);

        if (!isPeeking) {
          // for relink return parent prop...
          if (
            context.trackerNode &&
            trackerNode.id !== context.trackerNode.id
          ) {
            const contextProxy = context.trackerNode.proxy;
            const propProperties: Array<PropProperty> = contextProxy?.getProp(
              'propProperties'
            );
            propProperties.push({
              path: nextAccessPath,
              source: trackerNode.proxy,
            });
            this.setProp('propProperties', propProperties);
            if (trackerNode.proxy)
              return peek(trackerNode.proxy as IES5Tracker, nextAccessPath);
          }
          this.runFn('reportAccessPath', nextAccessPath);
        }

        if (!isTrackable(value)) return value;
        const childProxy = childProxies[prop];
        // for rebase value, if base value change, the childProxy should
        // be replaced
        if (childProxy && childProxy.base === value) {
          return childProxy;
        }
        return (childProxies[prop] = createES5Tracker(
          value,
          {
            accessPath: nextAccessPath,
            parentProxy: proxy,
            rootPath,
            useRevoke,
            useScope,
          },
          trackerNode
        ));
      },
    };

    Object.defineProperty(proxy, prop, desc);
  }

  each(target as Array<any>, (prop: PropertyKey) => {
    const desc = Object.getOwnPropertyDescriptor(target, prop);
    const enumerable = desc?.enumerable || false;
    proxyProperty(proxy, prop, enumerable);
  });

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([]);
    const keys = Object.getOwnPropertyNames(descriptors);

    const handler = (
      func: Function,
      functionContext: IES5Tracker,
      lengthGetter = true
    ) =>
      function(this: IES5Tracker) {
      const args = Array.prototype.slice.call(arguments) // eslint-disable-line
        this.runFn('assertRevoke');
        if (lengthGetter) {
          const accessPath = this.getProp('accessPath');
          const isPeeking = this.getProp('isPeeking');
          const nextAccessPath = accessPath.concat('length');

          if (!isPeeking) {
            if (
              context.trackerNode &&
              trackerNode.id !== context.trackerNode.id
            ) {
              const contextProxy = context.trackerNode.proxy;
              const propProperties = contextProxy?.getProp('propProperties');
              propProperties.push({
                path: nextAccessPath,
                source: trackerNode.proxy,
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
        const remarkLengthPropKeys = [
          'concat',
          'copyWith',
          'fill',
          'find',
          'findIndex',
          'lastIndexOf',
          'pop',
          'push',
          'reverse',
          'shift',
          'unshift',
          'slice',
          'sort',
          'splice',
          'includes',
          'indexOf',
          'join',
          'keys',
          'entries',
          'forEach',
          'filter',
          'flat',
          'flatMap',
          'map',
          'every',
          'some',
          'reduce',
          'reduceRight',
        ];
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
    useScope,
  });

  createHiddenProperty(proxy, 'getProps', function(this: IES5Tracker) {
    const args: Array<keyof ES5TrackerInterface> = Array.prototype.slice.call(
      arguments
    );
    return args.map(prop => this[TRACKER][prop]);
  });
  createHiddenProperty(proxy, 'getProp', function(this: IES5Tracker) {
    const args: Array<keyof ES5TrackerInterface> = Array.prototype.slice.call(
      arguments
    );
    return this[TRACKER][args[0]];
  });
  createHiddenProperty(proxy, 'setProp', function(this: IES5Tracker) {
    const args = Array.prototype.slice.call(arguments);
    const prop = args[0];
    const value = args[1];
    // @ts-ignore
    return (this[TRACKER][prop] = value);
  });
  createHiddenProperty(proxy, 'runFn', function(this: IES5Tracker) {
    const args = Array.prototype.slice.call(arguments);
    const fn = this[TRACKER][args[0] as keyof ES5TrackerInterface];
    const rest = args.slice(1);
    if (typeof fn === 'function') return (fn as Function).apply(this, rest);
  });
  createHiddenProperty(proxy, 'unlink', function(this: IES5Tracker) {
    return this.runFn('unlink');
  });
  createHiddenProperty(proxy, 'createChild', function(this: IES5Tracker) {
    const args = Array.prototype.slice.call(arguments);
    const target = args[0] || {};
    const config = args[1] || {};
    return createES5Tracker(
      target,
      {
        useRevoke,
        useScope,
        rootPath,
        ...config,
      },
      trackerNode
    );
  });
  createHiddenProperty(proxy, 'revoke', function(this: IES5Tracker) {
    const useRevoke = this.getProp('useRevoke');
    if (useRevoke) this.setProp('isRevoked', true);
  });

  createHiddenProperty(proxy, TRACKER, tracker);

  return proxy as IES5Tracker;
}

export default createES5Tracker;
