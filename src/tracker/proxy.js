import {
  isObject,
  TRACKER,
  each,
  Type,
  shallowCopy,
  emptyFunction,
  isTrackable,
  hasOwnProperty,
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

export function createTracker(target, config, trackerNode) {
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

  const copy = shallowCopy(target)

  const tracker = {
    type: Array.isArray(target) ? Type.Array : Type.Object,
    base: target,
    proxy: {},
    paths: [],
    accessPath,
    rootPath,
    revoke: () => { isRevoked = true },
    parentTrack,


    parent: null,
    children: [],
    prevSibling: null,
    nextSibling: null,


    relink: emptyFunction,
    unlink: emptyFunction,
    isPeekValue: false,

    propertyFromProps: [],
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
    getRemarkablePaths: emptyFunction,
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

    if (Array.isArray(base)) {
      nextProxy[TRACKER].base = base.filter(v => v)
    }
    nextProxy[TRACKER].base[last] = nextBaseValue

    if (isTrackable(nextBaseValue)) {
      proxyProps[last] = createTracker(nextBaseValue, {
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

  const revokeFn = function() {
    if (useRevoke) revoke()
  }

  createHiddenProperty(copy, TRACKER, tracker)
  createHiddenProperty(copy, 'getRemarkableFullPaths', tracker.getRemarkableFullPaths)
  createHiddenProperty(copy, 'getRemarkablePaths', tracker.getRemarkablePaths)
  createHiddenProperty(copy, 'setRemarkable', tracker.setRemarkable)
  createHiddenProperty(copy, 'cleanup', tracker.cleanup)
  createHiddenProperty(copy, 'getInternalPropExported', tracker.getInternalPropExported)
  createHiddenProperty(copy, 'unlink', unlink)
  createHiddenProperty(copy, 'relink', tracker.relink)
  createHiddenProperty(copy, 'rootPath', rootPath)
  createHiddenProperty(copy, 'revoke', revokeFn)

  const internalProps = [
    'getRemarkableFullPaths',
    'getRemarkablePaths',
    'setRemarkable',
    'cleanup',
    'getInternalPropExported',
    'relink',
    'unlink',
    'rootPath',
    TRACKER,
  ]

  const handler = {
    get: (target, prop, receiver) => {
      // assertScope(trackerNode, contextTrackerNode)
      // if (prop === TRACKER) return Reflect.get(target, prop, receiver)
      let tracker = target[TRACKER]
      // if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed) {
        // console.log('internal ', prop)
        return Reflect.get(target, prop, receiver)
      }

      if (!hasOwnProperty(tracker.base, prop)) {
        return Reflect.get(tracker.base, prop, receiver)
      }
      const accessPath = tracker.accessPath.concat(prop)

      if (!tracker.isPeekValue) {
        if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
          contextTrackerNode.tracker[TRACKER].propertyFromProps.push({
            path: accessPath,
            source: trackerNode.tracker,
            target: contextTrackerNode.tracker,
          })
          return peek(trackerNode.tracker, accessPath)
        } else {
          tracker.reportAccessPath(accessPath)
        }
      }

      if (hasOwnProperty(tracker.proxy, prop)) {
        return tracker.proxy[prop]
      }
      const value = tracker.base[prop]

      if (!isTrackable(value)) return value

      return (tracker.proxy[prop] = createTracker(value, {
        accessPath,
        parentTrack: target,
        rootPath,
      }, trackerNode))
    }
  }

  const { proxy, revoke } = Proxy.revocable(copy, handler)


  return proxy
}

const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  })
}