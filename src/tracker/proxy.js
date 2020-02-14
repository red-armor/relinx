import {
  isObject,
  TRACKER,
  shallowCopy,
  isTrackable,
  hasOwnProperty,
  createHiddenProperty,
} from './commons'
import ProxyTracker from './ProxyTracker'

import { trackerNode as contextTrackerNode } from './context'

const peek = (proxy, accessPath) => { // eslint-disable-line
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true)
    const nextProxy = proxy[cur]
    proxy.setProp('isPeeking', false)
    return nextProxy
  }, proxy)
}

function createTracker(target, config, trackerNode) {
  const {
    accessPath = [],
    parentProxy,
    useRevoke,
    useScope,
    rootPath = [],
  } = config || {}

  let isRevoked = false
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

  const copy = shallowCopy(target)

  const internalProps = [
    TRACKER,
    'runFn',
    'getProp',
    'setProp',
    'getProps',
  ]

  // can not use this in handler, should be `target`
  const handler = {
    get: (target, prop, receiver) => {
      if (prop === TRACKER) return Reflect.get(target, prop, receiver)
      // assertScope(trackerNode, contextTrackerNode)
      let tracker = target[TRACKER]

      // refer to immer...
      // if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed || !hasOwnProperty(tracker.base, prop)) {
        return Reflect.get(target, prop, receiver)
      }
      const accessPath = target.getProp('accessPath')
      const nextAccessPath = accessPath.concat(prop)
      const isPeeking = target.getProp('isPeeking')

      // const accessPath = tracker.accessPath.concat(prop)

      if (!isPeeking) {
        if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
          const contextProxy = contextTrackerNode.proxy
          const propProperties = contextProxy.getProp('propProperties')
          propProperties.push({
            path: nextAccessPath,
            source: trackerNode.proxy,
            target: contextTrackerNode.tracker,
          })
          target.setProp('propProperties', propProperties)
          return peek(trackerNode.proxy, nextAccessPath)
        }
        target.runFn('reportAccessPath', nextAccessPath)
      }
      const childProxies = target.getProp('childProxies')
      const base = target.getProp('base')
      const value = base[prop]

      if (!isTrackable(value)) return value
      const childProxy = childProxies[prop]

      // for rebase value, if base value change, the childProxy should
      // be replaced
      if (childProxy && childProxy.base === value) {
        return childProxy
      } else {
        return (childProxies[prop] = createTracker(value, {
          accessPath: nextAccessPath,
          parentProxy: target,
          rootPath,
        }, trackerNode))
      }
    }
  }

  const tracker = new ProxyTracker({
    base: target,
    parentProxy,
    accessPath,
    rootPath
  })

  const { proxy, revoke } = Proxy.revocable(copy, handler)

  createHiddenProperty(proxy, 'getProps', function() {
    const args = Array.prototype.slice.call(arguments)
    return args.map(prop => this[TRACKER][prop])
  })
  createHiddenProperty(proxy, 'getProp', function() {
    const args = Array.prototype.slice.call(arguments)
    return this[TRACKER][args[0]]
  })
  createHiddenProperty(proxy, 'setProp', function() {
    const args = Array.prototype.slice.call(arguments)
    const prop = args[0]
    const value = args[1]
    return this[TRACKER][prop] = value
  })
  createHiddenProperty(proxy, 'runFn', function() {
    const args = Array.prototype.slice.call(arguments)
    const fn = this[TRACKER][args[0]]
    const rest = args.slice(1)
    if (typeof fn === 'function') return fn.apply(this, rest)
    return
  })

  createHiddenProperty(proxy, TRACKER, tracker)

  return proxy
}

export default createTracker