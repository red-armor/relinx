import Computation from './Computation'
import central from './central'
import shouldWrappedByProxy from './utils/shouldWrappedByProxy'

// https://2ality.com/2016/11/proxying-builtins.html
// https://exploringjs.com/es6/ch_proxies.html

// 如果说存在的话，就返回相应的值，但是目前需要区分这个是否需要register
// 是否需要提供一个时机进行设置`timeToRegister`
// types could be wrapped by Proxy
const createHandler = (initialState = {}, comp, paths = []) => ({
  get: (target, property, receiver) => {
    let originalValue = Reflect.get(initialState, property, receiver)
    if (target.hasOwnProperty(property) || typeof originalValue === 'undefined') {
      central.register({ paths, comp, property })
    }

    const type = Object.prototype.toString.call(originalValue)
    if (shouldWrappedByProxy(originalValue)) {
      let nextValue = originalValue
      if (type === '[object Object]') {
        nextValue = { ...originalValue }
      }

      if (type === '[object Array]') {
        nextValue = [ ...originalValue ]
      }

      const next = new Proxy(nextValue, createHandler(
        nextValue,
        comp,
        paths.concat(property)
      ))
      Reflect.set(target, property, next, receiver)
    }

    return Reflect.get(target, property, receiver)
  },
})

function useTracker(fn, name) {
  const computation = new Computation(fn, name)
  const initialState = central.getCurrent()
  setTimeout(() => central.flush(), 0)
  // 如果说这里面的target使用`initialState`的话，`initialState`相当于被各种覆盖
  // 所以一定要确保经过`createHeader`一系列操作以后，`initialState`要依旧只含`plain object`；
  // 不能够被`Proxy`污染
  return [
    new Proxy({}, createHandler(initialState, computation, [])),
    () => computation.markAsDirty()
  ]
}

export default useTracker
