import Computation from './Computation'
import central from './central'

// https://2ality.com/2016/11/proxying-builtins.html
// https://exploringjs.com/es6/ch_proxies.html
const shouldWrappedByProxy = obj => {
  const type = Object.prototype.toString.call(obj)

  const types = [
    '[object Number]',
    '[object String]',
    '[object Date]',
  ]

  if (types.indexOf(type) !== -1) {
    return false
  }

  return true
}

// types could be wrapped by Proxy
const createHandler = (initialState = {}, comp, paths = []) => ({
  get: (target, property, receiver) => {
    const value = initialState[property] || {}
    const type = Object.prototype.toString.call(value)
    let nextValue

    console.log('property : ', property, value, type)

    if (type === '[object Object]') {
      nextValue = { ...value }
    }

    if (type === '[object Array]') {
      nextValue = value.slice()
    }

    central.register({ paths, comp, property })

    if (shouldWrappedByProxy(value)) {
      console.log('wrapped proxy')
      const next = new Proxy(nextValue, createHandler(
        nextValue,
        comp,
        paths.concat(property)
      ))
      Reflect.set(target, property, next, receiver)
    }

    return Reflect.get(target, property, receiver)
  }
})

function useTracker(fn) {
  const computation = new Computation(fn)
  const initialState = central.getCurrent()
  console.log('initial : ', initialState)
  setTimeout(() => central.flush(), 0)
  return new Proxy({}, createHandler(initialState, computation, []))
}

export default useTracker

// 通过顶层的数据源进行数据更新，然后分流
// notify value update