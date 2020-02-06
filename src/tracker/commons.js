const toString = Function.call.bind(Object.prototype.toString)
const ownKeys = o => Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))

export const emptyFunction = () => {}
export const isObject = o => o ? (typeof o === 'object' || typeof o === 'function') : false
export const hasSymbol = typeof Symbol !== "undefined"
export const TRACKER = hasSymbol ? Symbol("tracker") : "__tracker__"

export const canIUseProxy = () => {
  try {
    new Proxy({}, {}) // eslint-disable-line
  } catch (err) { return false }

  return true
}

export const hasOwnProperty = (o, prop) => o.hasOwnProperty(prop)

export const isTrackable = o => {
  return [
    '[object Object]',
    '[object Array]',
  ].indexOf(toString(o)) !== -1
}

export function each(obj, iter) {
  if (Array.isArray(obj)) {
    obj.forEach((entry, index) => iter(index, entry, obj))
  } else if (isObject(obj)) {
    Reflect.ownKeys(obj).forEach(key => iter(key, obj[key], obj))
  }
}

export const Type = {
  Object: 'object',
  Array: 'array',
}

export function shallowCopy(o) {
  if (Array.isArray(o)) return o.slice()
  const value = Object.create(Object.getPrototypeOf(o))
  ownKeys(o).forEach(key => {
    value[key] = o[key]
  })

  return value
}



