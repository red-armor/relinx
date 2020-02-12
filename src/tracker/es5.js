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
import { trackerNode as contextTrackerNode } from './context'

const peek = (proxy, accessPath) => {
  return accessPath.reduce((proxy, cur) => {
    proxy[TRACKER].isPeekValue = true
    const nextProxy = proxy[cur]
    proxy[TRACKER].isPeekValue = false
    return nextProxy
  }, proxy)
}

const getInternalProp = (proxy, props) => {
  const tracker = proxy[TRACKER]
  return props.reduce((o, prop) => {
    if (tracker[prop]) {
      o[prop] = tracker[prop]
    }
    return o
  }, {})
}

export function createES5Tracker(target, config, trackerNode) {
  const {
    accessPath = [],
    parentTrack,
    useRevoke,
    useScope,
    rootPath = [],
  } = config || {}

  let isRevoked = false
  let assertRevokable = () => {
    if (!useRevoke) return
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
    rootPath,
    revoke: () => { isRevoked = true },
    parentTrack,
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
    getRemarkablePaths: emptyFunction,

    parent: null,
    children: [],
    prevSibling: null,
    nextSibling: null,

    relink: emptyFunction,
    unlink: emptyFunction,
    isPeekValue: false,

    propertyFromProps: [],
  }

  tracker.reportAccessPath = function(path) {
    const tracker = proxy[TRACKER]
    tracker.paths.push(path)
    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack[TRACKER].reportAccessPath(path)
    }
  }

  tracker.cleanup = function() {
    proxy[TRACKER].paths = []
    proxy[TRACKER].propertyFromProps = []
  }

  const unlink = function() {
    const proxy = this
    const tracker = proxy[TRACKER]
    return tracker.base
  }

  tracker.relink = (path, baseValue) => {
    const copy = path.slice()
    const last = copy.pop()
    const nextProxy = peek(proxy, copy)
    const nextBaseValue = path.reduce((baseValue, cur) => baseValue[cur], baseValue)

    const { base, proxy: proxyProps } = getInternalProp(nextProxy, ['base', 'proxy'])

    base[last] = nextBaseValue
    if (isTrackable(nextBaseValue)) {
      proxyProps[last] = createES5Tracker(nextBaseValue, {
        // do not forget `prop` param
        accessPath: path,
        parentTrack: nextProxy,
        rootPath,
      }, trackerNode)
    }
  }

  tracker.setRemarkable = function() {
    const tracker = proxy[TRACKER]
    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack[TRACKER].reportAccessPath(tracker.accessPath)
      return true
    }
    return false
  }

  tracker.getRemarkableFullPaths = function() {
    const { paths, propertyFromProps } = getInternalProp(proxy, ['paths', 'propertyFromProps'])

    const internalPaths = generateRemarkablePaths(paths).map(path => {
      return rootPath.concat(path)
    })
    const external = propertyFromProps.map(prop => {
      const { path, source } = prop
      return source[TRACKER].rootPath.concat(path)
    })
    const externalPaths = generateRemarkablePaths(external)

    return internalPaths.concat(externalPaths)
  }

  tracker.getRemarkablePaths = function() {
    const tracker = proxy[TRACKER]
    const { revoke, paths } = tracker
    // revoke()
    return generateRemarkablePaths(paths)
  }

  tracker.getInternalPropExported = props => {
    const tracker = proxy[TRACKER]
    return props.reduce((o, prop) => {
      if (tracker[prop]) {
        o[prop] = tracker[prop]
      }
      return o
    }, {})
  }

  createHiddenProperty(proxy, TRACKER, tracker)
  createHiddenProperty(proxy, 'getRemarkableFullPaths', tracker.getRemarkableFullPaths)
  createHiddenProperty(proxy, 'getRemarkablePaths', tracker.getRemarkablePaths)
  createHiddenProperty(proxy, 'setRemarkable', tracker.setRemarkable)
  createHiddenProperty(proxy, 'cleanup', tracker.cleanup)
  createHiddenProperty(proxy, 'getInternalPropExported', tracker.getInternalPropExported)
  createHiddenProperty(proxy, 'relink', tracker.relink)
  createHiddenProperty(proxy, 'unlink', unlink)
  createHiddenProperty(proxy, 'rootPath', rootPath)

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
        const { base, proxy: proxyProps, accessPath, reportAccessPath } = this[TRACKER]
        const value = base[prop]

        // For es5, the prop in array index getter is integer; when use proxy,
        // `prop` will be string.
        const nextAccessPath = accessPath.concat(`${prop}`)

        if (!tracker.isPeekValue) {
          if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
            contextTrackerNode.tracker[TRACKER].propertyFromProps.push({
              path: nextAccessPath,
              source: trackerNode.tracker,
              target: contextTrackerNode.tracker,
            })
            return peek(trackerNode.tracker, nextAccessPath)
          } else {
            reportAccessPath(nextAccessPath)
          }
        }

        if (proxyProps[prop]) return proxyProps[prop]
        if (isTrackable(value)) return (proxyProps[prop] = createES5Tracker(value, {
          accessPath: nextAccessPath,
          parentTrack: proxy,
          rootPath,
        }, trackerNode))
        return value
      }
    }

    Object.defineProperty(proxy, prop, desc)
  }

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([])
    const keys = Object.getOwnPropertyNames(descriptors)

    const handler = (func, context, invokeLength = true) => function() {
      const args = Array.prototype.slice.call(arguments)
      assertRevokable()
      const tracker = this[TRACKER]
      if (invokeLength) {
        const { accessPath, reportAccessPath } = tracker
        const nextAccessPath = accessPath.concat('length')

        if (!tracker.isPeekValue) {
          if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
            contextTrackerNode.tracker[TRACKER].propertyFromProps.push({
              path: accessPath,
              source: trackerNode.tracker,
              target: contextTrackerNode.tracker,
            })
            return peek(trackerNode.tracker, nextAccessPath)
          } else {
            reportAccessPath(nextAccessPath)
          }
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

  return proxy
}

const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  })
}