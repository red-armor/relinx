import {
  hasOwnProperty,
  isTrackable,
  emptyFunction,
} from './commons'
import { generateRemarkablePaths } from './path'
import { trackerNode as contextTrackerNode } from './context'

const peek = (tracker, accessPath) => {
  return accessPath.reduce((tracker, cur) => {
    tracker.isPeekValue = true
    const nextTracker = tracker[cur]
    tracker.isPeekValue = false
    return nextTracker
  }, tracker)
}

const getInternalProp = (proxy, props) => {
  return props.reduce((o, prop) => {
    if (proxy[prop]) {
      o[prop] = proxy[prop]
    }
    return o
  }, {})
}

export function createTracker(base, config, trackerNode) {
  const {
    accessPath = [],
    parentTrack,
    useRevoke,
    useScope,
    rootPath = [],
  } = config || {}

  let tracker = {
    base,
    proxy: {},
    paths: [],
    accessPath,
    rootPath,
    revoke: emptyFunction,
    parentTrack,
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
    getRemarkablePaths: emptyFunction,
    getRemarkableFullPaths: emptyFunction,
    parent: null,
    children: [],
    prevSibling: null,
    nextSibling: null,
    relink: emptyFunction,
    isPeekValue: false,

    propertyFromProps: [],
  }

  tracker.reportAccessPath = path => {
    const { paths, parentTrack } = getInternalProp(proxy, ['paths', 'parentTrack'])
    paths.push(path)
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
    }
  }

  tracker.cleanup = function() {
    this.paths = []
    this.propertyFromProps = []
  }

  tracker.relink = (path, baseValue) => {
    const copy = path.slice()
    const last = copy.pop()
    const tracker = peek(proxy, copy)
    const nextBaseValue = path.reduce((baseValue, cur) => baseValue[cur], baseValue)
    const { base, proxy: proxyProps } = getInternalProp(tracker, ['base', 'proxy'])

    base[last] = nextBaseValue
    if (isTrackable(nextBaseValue)) {
      proxyProps[last] = createTracker(nextBaseValue, {
        // do not forget `prop` param
        accessPath: path,
        parentTrack: tracker,
      }, trackerNode)
    }
  }

  tracker.relinkProp = (prop, baseValue) => {
    const { base, proxy: proxyProps } = getInternalProp(proxy, ['base', 'proxy'])

    base[prop] = baseValue
    if (isTrackable(baseValue)) {
      proxyProps[prop] = createTracker(baseValue, {
        // do not forget `prop` param
        accessPath: accessPath.concat(prop),
        parentTrack: proxy,
      }, trackerNode)
    }
  }

  tracker.setRemarkable = function() {
    const { parentTrack } = getInternalProp(proxy, ['parentTrack'])
    if (parentTrack) {
      parentTrack.reportAccessPath(proxy.accessPath)
      return true
    }
    return false
  }

  tracker.getRemarkablePaths = function() {
    const { paths }  = proxy
    return generateRemarkablePaths(paths)
  }

  tracker.getRemarkableFullPaths = function() {
    const { paths, propertyFromProps } = getInternalProp(
      proxy, ['paths', 'propertyFromProps']
    )

    const internalPaths = generateRemarkablePaths(paths).map(path => {
      return rootPath.concat(path)
    })

    const external = propertyFromProps.map(prop => {
      const { path, source } = prop
      return source.rootPath.concat(path)
    })
    const externalPaths = generateRemarkablePaths(external)

    return internalPaths.concat(externalPaths)
  }

  const assertScope = (trackerNode, contextTrackerNode) => {
    if (useScope) {
      // If `trackerNode` is null, it means access top most data prop.
      if (!trackerNode) {
        console.warn(
          '`trackerNode` is undefined, which means you are using `createTracker` function directly.' +
          'Maybe you should call `TrackerNode` or set `useScope` to false in config param'
        )
      } else if (!contextTrackerNode) {
        console.warn(
          `contextTrackerNode is undefined, which means trackerNode(${trackerNode.id})\n` +
          'is accessed after finish tracking property. You can do as follows: \n' +
          '  trackerNode.enterContext() // manually set current context value\n' +
          '  // ... code to access trackerNode\n' +
          '  trackerNode.leaveContext()'
        )
      } else if (!trackerNode.contains(contextTrackerNode))
        throw new Error(
          `'${contextTrackerNode.id}' should be children of '${trackerNode.id}'\n` +
          'Property only could be accessed by self node or parent node.'
        )
    }
  }

  const internalProps = Object.getOwnPropertyNames(tracker)

  // Should be placed after get `internalProps`
  if (Array.isArray(base)) {
    // if `base` is array, it will be export as one length array `tracker`;
    // One length array will has only one item processed when invoke `map`, `forEach` ets.
    const len = base.length
    // why `fill(null)` ? `map`, `forEach` and other prototype functions will
    // ignore `undefined` value when iterate...
    const after = len > 1 ? new Array(len - 1).fill(null) : []
    tracker = [tracker].concat(after)
  }

  const handler = {
    get: (tracker, prop, receiver) => {
      console.log('prop ', prop)
      // TODO --------
      assertScope(trackerNode, contextTrackerNode)
      let target = tracker
      if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed) return Reflect.get(target, prop, receiver)
      if (!hasOwnProperty(target.base, prop)) {
        console.log('xxxx', prop, target.base, Reflect.get(target.base, prop, receiver))
        return Reflect.get(target.base, prop, receiver)
      }
      const accessPath = target.accessPath.concat(prop)

      if (!tracker.isPeekValue) {
        if (contextTrackerNode && trackerNode.id !== contextTrackerNode.id) {
          // contextTrackerNode.tracker.paths.push(accessPath)
          contextTrackerNode.tracker.propertyFromProps.push({
            path: accessPath,
            source: trackerNode.tracker,
            target: contextTrackerNode.tracker,
          })
          return peek(trackerNode.tracker, accessPath)
        } else {
          target.reportAccessPath(accessPath)
        }
      }

      if (hasOwnProperty(target.proxy, prop)) {
        return target.proxy[prop]
      }
      const value = target.base[prop]

      if (!isTrackable(value)) return value

      return (target.proxy[prop] = createTracker(value, {
        accessPath,
        parentTrack: target,
        rootPath,
      }, trackerNode))
    }
  }

  const { proxy, revoke } = Proxy.revocable(tracker, handler)
  proxy.revoke = () => {
    if (useRevoke) revoke()
  }

  return proxy
}