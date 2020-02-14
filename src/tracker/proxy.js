/* eslint-disable */
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
import infoLog from '../utils/infoLog'

const peek = (proxy, accessPath) => {
  try {
    return accessPath.reduce((proxy, cur) => {
      if (typeof proxy === 'undefined') return
      proxy[TRACKER].isPeekValue = true
      const nextProxy = proxy[cur]
      proxy[TRACKER].isPeekValue = false
      return nextProxy
    }, proxy)
  } catch(err) {
    infoLog('[proxy] peek ', err, proxy, accessPath)
  }
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

const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  })
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

    propProperties: [],
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

  tracker.cleanup = function () {
    proxy[TRACKER].paths = []
    proxy[TRACKER].propProperties = []
  }

  const unlink = function () {
    const proxy = this // eslint-disable-line
    const tracker = proxy[TRACKER]
    return tracker.base
  }

  tracker.rebase = function(baseValue) {
    try {
      const proxy = this
      proxy[TRACKER].base = baseValue
    } catch(err) {
      infoLog('[proxy] rebase ', err)
    }
  }

  tracker.relink = function (path, baseValue) {
    try {
      const proxy = this
      let copy = path.slice()
      let last = copy.pop()
      const len = path.length
      let nextBaseValue = baseValue

      // 修复 {a: { b: 1 }} => {a: {}} 时出现 nextBaseValue[key]为undefined
      for (let i = 0; i < len; i++) {
        const key = path[i]
        if (typeof nextBaseValue[key] !== 'undefined') {
          nextBaseValue = nextBaseValue[key]
        } else {
          copy = path.slice(0, i - 1)
          last = path[i - 1]

          break;
        }
      }

      const nextProxy = peek(proxy, copy)

      nextProxy.relinkProp(last, nextBaseValue, nextProxy)
    } catch (err) {
      infoLog('[proxy relink issue]', path, baseValue, err)
    }
  }

  tracker.relinkProp = function(prop, newValue, proxy) {
    const nextProxy = proxy || this
    try {
      const {
        base,
        proxy: proxyProps,
        accessPath,
      } = getInternalProp(nextProxy, ['base', 'proxy', 'accessPath'])

      if (Array.isArray(base)) {
        nextProxy[TRACKER].base = base.filter(v => v)
      }
      nextProxy[TRACKER].base[prop] = newValue

      if (isTrackable(newValue)) {
        proxyProps[prop] = createTracker(newValue, {
          // do not forget `prop` param
          accessPath: accessPath.concat(prop),
          parentTrack: nextProxy,
          rootPath,
        }, trackerNode)
      }
    } catch (err) {
      infoLog('[proxy relink prop issue]', err)
    }
  }

  tracker.setRemarkable = function () {
    const tracker = proxy[TRACKER]
    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack[TRACKER].reportAccessPath(tracker.accessPath)
      return true
    }
    return false
  }

  tracker.getRemarkableFullPaths = function() {
    try {
      const { paths, propProperties } = getInternalProp(proxy, ['paths', 'propProperties'])
      const internalPaths = generateRemarkablePaths(paths).map(path => {
        return rootPath.concat(path)
      })

      const external = propProperties.map(prop => {
        const { path, source } = prop
        return source[TRACKER].rootPath.concat(path)
      })
      const externalPaths = generateRemarkablePaths(external)

      return internalPaths.concat(externalPaths)
    } catch (err) {
      infoLog("[proxy getRemarkableFullPaths] ", err)
    }
  }

  tracker.getRemarkablePaths = function () {
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

  const revokeFn = function () {
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
  createHiddenProperty(copy, 'rebase', tracker.rebase)
  createHiddenProperty(copy, 'relinkProp', tracker.relinkProp)
  createHiddenProperty(copy, 'rootPath', rootPath)
  createHiddenProperty(copy, 'revoke', revokeFn)

  const internalProps = [
    'getRemarkableFullPaths',
    'getRemarkablePaths',
    'setRemarkable',
    'cleanup',
    'getInternalPropExported',
    'relink',
    'rebase',
    'relinkProp',
    'unlink',
    'rootPath',
    TRACKER,
  ]

  const handler = {
    get: (target, prop, receiver) => {
      try {
        // assertScope(trackerNode, contextTrackerNode)
        // if (prop === TRACKER) return Reflect.get(target, prop, receiver)
        let tracker = target[TRACKER]
        // if (Array.isArray(tracker)) target = tracker[0]
        const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
        if (isInternalPropAccessed) {
          return Reflect.get(target, prop, receiver)
        }

        if (!hasOwnProperty(tracker.base, prop)) {
          return Reflect.get(tracker.base, prop, receiver)
        }
        const accessPath = tracker.accessPath.concat(prop)

        if (!tracker.isPeekValue) {
          if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
            contexttrackerNode.proxy[TRACKER].propProperties.push({
              path: accessPath,
              source: trackerNode.proxy,
              target: contexttrackerNode.proxy,
            })
            return peek(trackerNode.proxy, accessPath)
          } else {
            tracker.reportAccessPath(accessPath)
          }
        }

        const value = tracker.base[prop]
        if (!isTrackable(value)) return value

        if (hasOwnProperty(tracker.proxy, prop) && tracker.proxy[prop][TRACKER].base === value) {
          return tracker.proxy[prop]
        } else {
          return (tracker.proxy[prop] = createTracker(value, {
            accessPath,
            parentTrack: target,
            rootPath,
          }, trackerNode))
        }
      } catch(err) {
        infoLog('[Proxy get] ', err)
      }
    }
  }

  const { proxy, revoke } = Proxy.revocable(copy, handler)


  return proxy
}
