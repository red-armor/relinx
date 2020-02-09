import {
  hasOwnProperty,
  isTrackable,
  emptyFunction,
} from './commons'
import { generateRemarkablePaths } from './path'
import { trackerNode } from './context'

const peek = (tracker, accessPath) => {
  const value = accessPath.reduce((value, cur) => {
    value.isPeekValue = true
    const v = value[cur]
    value.isPeekValue = false
    return v
  }, tracker)

  return value
}

export function createTracker(base, config, contextTrackerNode) {
  const {
    accessPath = [],
    parentTrack,
    useRevoke,
    useScope,
  } = config || {}

  let tracker = {
    base,
    proxy: {},
    paths: [],
    accessPath,
    revoke: emptyFunction,
    parentTrack,
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
    getRemarkablePaths: emptyFunction,

    parent: null,
    children: [],
    prevSibling: null,
    nextSibling: null,
    relink: emptyFunction,
    isPeekValue: false,

    propertyFromProps: [],
  }

  tracker.reportAccessPath = path => {
    proxy.paths.push(path)
    // console.log('report access path ', path, proxy.paths, proxy)

    const parentTrack = proxy.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
    }
  }

  tracker.relink = (path, base) => {
    const copy = path.slice()
    const last = copy.pop()
    const tracker = peek(proxy, copy)
    const value = path.reduce((base, cur) => base[cur], base)

    tracker.base[last] = value
    if (isTrackable(value)) {
      tracker.proxy[prop] = createTracker(value, {
        // do not forget `prop` param
        accessPath: path,
        parentTrack: tracker,
      }, contextTrackerNode)
    }
  }

  tracker.relinkProp = (prop, value) => {
    proxy.base[prop] = value
    if (isTrackable(value)) {
      proxy.proxy[prop] = createTracker(value, {
        // do not forget `prop` param
        accessPath: accessPath.concat(prop),
        parentTrack: proxy,
      }, contextTrackerNode)
    }
  }

  tracker.setRemarkable = function() {
    const parentTrack = proxy.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(proxy.accessPath)
      return true
    }
    return false
  }

  tracker.getRemarkablePaths = function() {
    const { paths } = proxy
    return generateRemarkablePaths(paths)
  }

  const assertScope = (parentNode, childNode) => {
    console.log('parent node ', parentNode, childNode)

    if (useScope) {
      // If `contextTrackerNode` is null, it means access top most data prop.
      // console.log('context tracker node ', contextTrackerNode)
      if (!parentNode) {
        console.warn(
          '`currentTrackerNode` is undefined, which means you are using `createTracker` function directly.' +
          'Maybe you should call `TrackerNode` or set `useScope` to false in config param'
        )
      } else if (!parentNode.contains(childNode))
        throw new Error(
          JSON.stringify(trackerNode) +
          'is not child node of ' +
          JSON.stringify(parentNode) +
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
      // TODO --------
      // assertScope(contextTrackerNode, trackerNode)
      let target = tracker
      if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed) return Reflect.get(target, prop, receiver)
      if (!hasOwnProperty(target.base, prop)) {
        return Reflect.get(target.base, prop, receiver)
      }
      const accessPath = target.accessPath.concat(prop)

      if (!tracker.isPeekValue) {
        if (trackerNode && contextTrackerNode.id !== trackerNode.id) {
          trackerNode.tracker.paths.push(accessPath)
          trackerNode.tracker.propertyFromProps.push({
            path: accessPath,
            source: contextTrackerNode.tracker,
            target: trackerNode.tracker,
          })
          return peek(contextTrackerNode.tracker, accessPath)
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
      }, contextTrackerNode))
    }
  }

  const { proxy, revoke } = Proxy.revocable(tracker, handler)
  proxy.revoke = () => {
    if (useRevoke) revoke()
  }

  return proxy
}