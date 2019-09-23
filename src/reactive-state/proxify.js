import shouldWrappedByProxy from './shouldWrappedByProxy'

const createHandler = (cb, paths = []) => ({
  get: (target, property, receiver) => {
    return Reflect.get(target, property, receiver)
  },
  set: (target, property, value, receiver) => {
    const oldValue = Reflect.get(target, property, receiver)
    if (oldValue !== value) {
      if (typeof cb === 'function') cb(paths.concat(property), value)
      Reflect.set(target, property, value, receiver)
    }
    return true
  }
})

const proxify = (obj, cb, paths = []) => {
  const result = {}

  if (Object.prototype.toString.call(obj) === '[object Object]') {
    const keys = Object.keys(obj)

    keys.forEach(key => {
      const value = obj[key]

      if (shouldWrappedByProxy(value)) {
        result[key] = proxify(value, cb, paths.concat(key))
      } else {
        result[key] = value
      }
    })

    return new Proxy(result, createHandler(cb, paths))
  }

  return obj
}

export default proxify