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
  }

  tracker.reportAccessPath = path => {
    proxy.paths.push(path)

    const parentTrack = proxy.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
    }
  }

  tracker.relink = (prop, value) => {
    proxy.base[prop] = value
    proxy.proxy[prop] = createTracker(value, {
      accessPath,
      parentTrack: proxy,
    }, contextTrackerNode)
    console.log('orox ', proxy)
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
    const { revoke, paths } = proxy
    revoke()
    return generateRemarkablePaths(paths)
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
  proxy.revoke = revoke

  return proxy
}