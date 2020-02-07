import {
  isObject,
  TRACKER,
  each,
  Type,
  shallowCopy,
  emptyFunction,
  isTrackable,
} from './commons'
import { generateRemarkablePaths } from './path'

export function createES5Tracker(target, config) {
  const {
    accessPath = [],
    parentTrack,
  } = config || {}

  let isRevoked = false
  let assertRevokable = tracker => {
    if (isRevoked) {
      throw new Error(
        "Cannot use a proxy that has been revoked. Did you pass an object " +
        "to an async process? "
      )
    }
  }

  if (!isObject(target)) {
    throw new TypeError('Cannot create proxy with a non-object as target or handler')
  }

  const proxy = shallowCopy(target)
  const tracker = {
    type: Array.isArray(target) ? Type.Array : Type.Object,
    base: target,
    proxy: {},
    paths: [],
    accessPath,
    revoke: () => { isRevoked = true },
    parentTrack,
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
    getRemarkablePaths: emptyFunction,
  }

  tracker.reportAccessPath = function(path) {
    const tracker = proxy[TRACKER]
    tracker.paths.push(path)
    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
    }
  }

  tracker.setRemarkable = function() {
    const tracker = proxy[TRACKER]
    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(tracker.accessPath)
      return true
    }
    return false
  }

  tracker.getRemarkablePaths = function() {
    const tracker = proxy[TRACKER]
    const { revoke, paths } = tracker
    revoke()
    return generateRemarkablePaths(paths)
  }

  createHiddenProperty(proxy, TRACKER, tracker)
  createHiddenProperty(proxy, 'getRemarkablePaths', tracker.getRemarkablePaths)
  createHiddenProperty(proxy, 'setRemarkable', tracker.setRemarkable)

  each(target, prop => {
    const desc = Object.getOwnPropertyDescriptor(target, prop)
    const enumerable = desc.enumerable
    proxyProperty(proxy, prop, enumerable)
  })

  function proxyProperty(proxy, prop, enumerable) {
    const desc = {
      enumerable: enumerable,
      get() {
        assertRevokable()
        const { base, proxy, accessPath, reportAccessPath } = this[TRACKER]
        const value = base[prop]

        // For es5, the prop in array index getter is integer; when use proxy,
        // `prop` will be string.
        const nextAccessPath = accessPath.concat(`${prop}`)
        reportAccessPath(nextAccessPath)

        if (proxy[prop]) return proxy[prop]
        if (isTrackable(value)) return (proxy[prop] = createES5Tracker(value, {
          accessPath: nextAccessPath,
          parentTrack: this[TRACKER],
        }))
        return value
      }
    }

    Object.defineProperty(proxy, prop, desc)
  }

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([])
    const keys = Object.getOwnPropertyNames(descriptors)

    const handler = (func, context, invokeLength) => function() {
      const args = Array.prototype.slice.call(arguments)
      assertRevokable()
      const tracker = this[TRACKER]
      if (invokeLength) {
        const { accessPath, parentTrack, paths } = tracker
        const nextAccessPath = accessPath.concat('length')
        paths.push(nextAccessPath)
        if (parentTrack) {
          parentTrack.reportAccessPath(nextAccessPath)
        }
      }

      return func.apply(context, args)
    }

    keys.forEach(key => {
      const func = descriptors[key]
      if (typeof func === 'function') {
        if (key === 'concat') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'copyWith') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'fill') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'find') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'findIndex') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'lastIndexOf') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'pop') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'push') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reverse') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'shift') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'unshift') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'slice') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'sort') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'splice') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'includes') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'indexOf') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'join') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'keys') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'entries') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'forEach') createHiddenProperty(proxy, key, handler(func, proxy, true))
        if (key === 'filter') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'flat') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'flatMap') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'map') createHiddenProperty(proxy, key, handler(func, proxy, true))
        if (key === 'every') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'some') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reduce') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reduceRight') createHiddenProperty(proxy, key, handler(func, proxy))
      }
    })
  }

  return proxy
}

createES5Tracker.revocable = (target, handler) => {
  const proxy = createES5Tracker(target, handler)
  return { proxy, revoke: proxy.assertRevokable() }
}

const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  })
}