import {
  isObject,
  TRACKER,
  each,
  shallowCopy,
  isTrackable,
  createHiddenProperty,
} from './commons'
import ES5Tracker from './ES5Tracker'

import { trackerNode as contextTrackerNode } from './context'

const peek = (proxy, accessPath) => { // eslint-disable-line
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true)
    const nextProxy = proxy[cur]
    proxy.setProp('isPeeking', false)
    return nextProxy
  }, proxy)
}

function createES5Tracker(target, config, trackerNode) {
  const {
    accessPath = [],
    parentProxy,
    useRevoke,
    useScope,
    rootPath = [],
  } = config || {}

  const isRevoked = false
  const assertRevokable = () => {
    if (!useRevoke) return
    if (isRevoked) {
      throw new Error(
        'Cannot use a proxy that has been revoked. Did you pass an object '
        + 'to an async process? '
      )
    }
  }

  if (!isObject(target)) {
    throw new TypeError('Cannot create proxy with a non-object as target or handler')
  }

  const proxy = shallowCopy(target)

  function proxyProperty(proxy, prop, enumerable) {
    const desc = {
      enumerable,
      configurable: false,
      get() {
        assertRevokable()
        const base = this.getProp('base')
        const accessPath = this.getProp('accessPath')
        const childProxies = this.getProp('childProxies')
        const isPeeking = this.getProp('isPeeking')
        const value = base[prop]
        // For es5, the prop in array index getter is integer; when use proxy,
        // `prop` will be string.
        const nextAccessPath = accessPath.concat(`${prop}`)

        if (!isPeeking) {
          if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
            const contextProxy = contextTrackerNode.proxy
            const propProperties = contextProxy.getProp('propProperties')
            propProperties.push({
              path: nextAccessPath,
              source: trackerNode.proxy,
              target: contextTrackerNode.tracker,
            })
            this.setProp('propProperties', propProperties)
            return peek(trackerNode.proxy, nextAccessPath)
          }
          this.runFn('reportAccessPath', nextAccessPath)
        }

        if (!isTrackable(value)) return value
        const childProxy = childProxies[prop]
        // for rebase value, if base value change, the childProxy should
        // be replaced
        if (childProxy && childProxy.base === value) {
          return childProxy
        }
        return (childProxies[prop] = createES5Tracker(value, {
          accessPath: nextAccessPath,
          parentProxy: proxy,
          rootPath,
        }, trackerNode))
      },
    }

    Object.defineProperty(proxy, prop, desc)
  }

  each(target, prop => {
    const desc = Object.getOwnPropertyDescriptor(target, prop)
    const enumerable = desc.enumerable
    proxyProperty(proxy, prop, enumerable)
  })

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([])
    const keys = Object.getOwnPropertyNames(descriptors)

    const handler = (func, context, lengthGetter = true) => function () {
      const args = Array.prototype.slice.call(arguments) // eslint-disable-line
      assertRevokable()
      if (lengthGetter) {
        const accessPath = this.getProp('accessPath')
        const isPeeking = this.getProp('isPeeking')
        const nextAccessPath = accessPath.concat('length')

        if (!isPeeking) {
          if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
            const contextProxy = contextTrackerNode.proxy
            const propProperties = contextProxy.getProp('propProperties')
            propProperties.push({
              path: nextAccessPath,
              source: trackerNode.proxy,
              target: contextTrackerNode.tracker,
            })

            this.setProp('propProperties', propProperties)
          }
          this.runFn('reportAccessPath', nextAccessPath)
        }
      }

      return func.apply(context, args)
    }

    keys.forEach(key => {
      const func = descriptors[key]
      if (typeof func === 'function') {
        const notRemarkLengthPropKeys = ['concat', 'copyWith']
        const remarkLengthPropKeys = [
          'concat', 'copyWith', 'fill', 'find', 'findIndex', 'lastIndexOf',
          'pop', 'push', 'reverse', 'shift', 'unshift', 'slice',
          'sort', 'splice', 'includes', 'indexOf', 'join', 'keys',
          'entries', 'forEach', 'filter', 'flat', 'flatMap', 'map',
          'every', 'some', 'reduce', 'reduceRight',
        ]
        if (notRemarkLengthPropKeys.indexOf(key) !== -1) {
          createHiddenProperty(proxy, key, handler(func, proxy, false))
        } else if (remarkLengthPropKeys.indexOf(key) !== -1) {
          createHiddenProperty(proxy, key, handler(func, proxy))
        }
      }
    })
  }

  const tracker = new ES5Tracker({
    base: target,
    parentProxy,
    accessPath,
    rootPath,
  })

  createHiddenProperty(proxy, 'getProps', function () {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    return args.map(prop => this[TRACKER][prop])
  })
  createHiddenProperty(proxy, 'getProp', function () {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    return this[TRACKER][args[0]]
  })
  createHiddenProperty(proxy, 'setProp', function () {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    const prop = args[0]
    const value = args[1]
    return this[TRACKER][prop] = value
  })
  createHiddenProperty(proxy, 'runFn', function () {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    const fn = this[TRACKER][args[0]]
    const rest = args.slice(1)
    if (typeof fn === 'function') return fn.apply(this, rest)
  })
  createHiddenProperty(proxy, 'unlink', function () {
    return this.runFn('unlink')
  })

  createHiddenProperty(proxy, TRACKER, tracker)

  return proxy
}

export default createES5Tracker
