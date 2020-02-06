import {
  hasOwnProperty,
  isTrackable,
  emptyFunction,
} from './commons'

export function createTracker(base, configs = {}) {
  const {
    accessPath = [],
    parentTrack,
  } = configs

  let tracker = {
    base,
    proxy: {},
    paths: [],
    accessPath,
    revoke: emptyFunction,
    parentTrack,
    reportAccessPath: emptyFunction,
    setRemarkable: emptyFunction,
  }

  tracker.reportAccessPath = path => {
    proxy.paths.push(path)

    const parentTrack = proxy.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
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

  const internalProps = Object.getOwnPropertyNames(tracker)

  // Should be placed after get `internalProps`
  if (Array.isArray(base)) {
    tracker = [tracker]
  }

  const handler = {
    get: (tracker, prop, receiver) => {
      let target = tracker
      if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed) return Reflect.get(target, prop, receiver)
      if (!hasOwnProperty(target.base, prop)) return Reflect.get(target.base, prop, receiver)
      if (hasOwnProperty(target.proxy, prop)) return target.proxy[prop]
      const value = target.base[prop]
      const accessPath = target.accessPath.concat(prop)
      target.reportAccessPath(accessPath)
      if (!isTrackable(value)) return value

      return (target.proxy[prop] = createTracker(value, {
        accessPath,
        parentTrack: target,
      }))
    }
  }

  const { proxy, revoke } = Proxy.revocable(tracker, handler)
  tracker.revoke = revoke

  return proxy
}