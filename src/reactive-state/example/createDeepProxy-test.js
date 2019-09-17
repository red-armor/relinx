const IS_PROXY = Symbol('is proxy')
const IS_HEADING = Symbol('is heading')

const sample = { a: { b: { c: 2 }}, f: { q: 1}}

let count = 0

const createDeepProxy = obj => {
  const keys = Object.keys(obj)
  const result = {}

  keys.forEach(key => {
    const value = obj[key]

    if (typeof value !== 'object') {
      result[key] = value
      return
    }

    if (value[IS_PROXY]) return

    if (Object.prototype.toString.call(value) !== '[object Object]') {
      result[key] = createProxy(value)
    } else {
      result[key] = createDeepProxy(value)
    }
  })

  return createProxy(result)
}

const createProxy = obj => {
  const proxy = new Proxy(obj, {
    get(target, property, receiver) {

      if (target[IS_HEADING]) {
        count += 1
      }

      return Reflect.get(target, property, receiver)
    },

    set(target, property, newValue, receiver) {
      Reflect.set(target, property, newValue, receiver)
      return true
    }
  })

  proxy[IS_PROXY] = true

  return proxy
}

const p = createDeepProxy(sample)
p[IS_HEADING] = true
console.log(p)
console.log(p.a.b)
// get property : a
// get property : b
p.a.b.c = 5
// get property : a
// get property : b
// set property : c

console.log(p.f)
console.log(p.f.q)