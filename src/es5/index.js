const isObject = o => o ? (typeof o === 'object' || typeof o === 'function') : false
const hasSymbol = typeof Symbol !== "undefined"

export const STATE = hasSymbol ? Symbol("state") : "__state__"

function each(obj, iter) {
  if (Array.isArray(obj)) {
    obj.forEach((entry, index) => iter(index, entry, obj))
  } else if (isObject(obj)) {
    Reflect.ownKeys(obj).forEach(key => iter(key, obj[key], obj))
  }
}

const Type = {
  Object: 'object',
  Array: 'array',
}

const ownKeys = o => Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))

function shallowCopy(o) {
  if (Array.isArray(o)) return o.slice()
  const value = Object.create(Object.getPrototypeOf(o))
  ownKeys(o).forEach(key => {
    value[key] = o[key]
  })

  return value
}

function ProxyPolyfill(target) {
  let assertRevokable = state => {
    assertRevokable = state => {
      throw new Error(
        "Cannot use a proxy that has been revoked. Did you pass an object " +
        "from inside an immer function to an async process? " +
				JSON.stringify(latest(state))
      )
    }
  }

  if (!isObject(target)) {
    throw new TypeError('Cannot create proxy with a non-object as target or handler')
  }

  if (!new.target) { throw 'Proxy must be called with new' }

  const proxy = shallowCopy(target)
  const state = {
    type: Array.isArray(target) ? Type.Array : Type.Object,
    value: shallowCopy(target),
  }

  createHiddenProperty(proxy, STATE, state)
  each(target, key => proxyProperty(target, proxy, key))

  function proxyProperty(base, proxy, prop) {
    const baseDesc = Object.getOwnPropertyDescriptor(base, prop)
    const desc = {
      enumerable: baseDesc.enumerable,
      get() {
        console.log('register ', prop)
        return this[STATE].value[prop] || base[prop]
      },
      set(value) {
        return (this[STATE].value[prop] = value)
      },
    }

    Object.defineProperty(proxy, prop, desc)
  }

  if (Array.isArray(target)) {
    const descriptors = Object.getPrototypeOf([])
    const keys = Object.getOwnPropertyNames(descriptors)

    const handler = (func, context, invokeLength) => (...args) => {
      assertRevokable()

      if (invokeLength) console.log('register length')

      return func.call(context, ...args)
    }

    keys.forEach(key => {
      const func = descriptors[key]
      if (typeof func === 'function') {
        if (key === 'concat') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'copyWith') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'fill') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'find') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'findIndex') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'lastIndexOf') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'pop') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'push') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reverse') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'shift') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'unshift') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'slice') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'sort') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'splice') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'includes') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'indexOf') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'join') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'keys') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'entries') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'forEach') createHiddenProperty(proxy, key, handler(func, proxy, true))
        if (key === 'filter') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'flat') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'flatMap') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'map') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'every') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'some') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reduce') createHiddenProperty(proxy, key, handler(func, proxy))
        if (key === 'reduceRight') createHiddenProperty(proxy, key, handler(func, proxy))
      }
    })
  }

  return proxy
}

ProxyPolyfill.revocable = (target, handler) => {
  const proxy = new ProxyPolyfill(target, handler)
  return { proxy, revoke: proxy.assertRevokable() }
}

const createHiddenProperty = (target, prop, value) => {
  Object.defineProperty(target, prop, {
    value,
    enumerable: false,
    writable: true,
  })
}

export default ProxyPolyfill