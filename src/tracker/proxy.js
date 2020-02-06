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
  }

   tracker.reportAccessPath = path => {
    tracker.paths.push(path)

    const parentTrack = tracker.parentTrack
    if (parentTrack) {
      parentTrack.reportAccessPath(path)
    }
  }

  if (Array.isArray(base)) {
    tracker = [tracker]
  }

  const internalProps = Object.getOwnPropertyNames(tracker)

  const handler = {
    get: (tracker, prop, receiver) => {
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed) {
        return Reflect.get(tracker, prop, receiver)
      }

      if (!hasOwnProperty(tracker.base, prop))
        return Reflect.get(tracker.base, prop, receiver)

      if (hasOwnProperty(tracker.proxy, prop)) {
        return tracker.proxy[prop]
      }

      const value = tracker.base[prop]

      const accessPath = tracker.accessPath.concat(prop)
      tracker.reportAccessPath(accessPath)

      if (!isTrackable(value)) return value

      return (tracker.proxy[prop] = createTracker(value, {
        accessPath,
        parentTrack: tracker,
      }))
    }
  }

  const { proxy, revoke } = Proxy.revocable(tracker, handler)
  tracker.revoke = revoke

  return proxy
}