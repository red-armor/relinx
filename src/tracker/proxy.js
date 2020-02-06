import {
  hasOwnProperty,
  isTrackable,
  emptyFunction,
} from './commons'

export function createTracker(base) {
  console.log(base)
  let tracker = {
    base,
    proxy: {},
    paths: [],
    revoke: emptyFunction,
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
      tracker.paths.push(prop)
      if (!isTrackable(value)) return value

      return (tracker.proxy[prop] = createTracker(value))
    }
  }

  const { proxy, revoke } = Proxy.revocable(tracker, handler)
  tracker.revoke = revoke

  return proxy
}