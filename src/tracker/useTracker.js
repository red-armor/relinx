import Computation from './Computation'
import central from './central'
import shouldWrappedByProxy from './utils/shouldWrappedByProxy'

// https://2ality.com/2016/11/proxying-builtins.html
// https://exploringjs.com/es6/ch_proxies.html

// 如果说存在的话，就返回相应的值，但是目前需要区分这个是否需要register
// 是否需要提供一个时机进行设置`timeToRegister`
// types could be wrapped by Proxy
const createHandler = (initialState = {}, comp, paths = [], reactivePath) => ({
  get: (target, property, receiver) => {
    const originalValue = Reflect.get(initialState, property, receiver)

    // 比如将data作为props往下传递的时候，`reactive`对于子组件而言没有存在的意义；所以这里面
    // 返回一个`unProxy`对象
    if (property === 'getUnTrack') {
      if (Array.isArray(target)) {
        const len = target.length
        for (let i = 0; i < len; i++) {
          central.register({ paths, comp, property: i })
        }
      }
      return () => initialState
    }
    const type = Object.prototype.toString.call(originalValue)

    // 支持指定关心的路径
    if (reactivePath.length > 0) {
      const fullPaths = [].concat(paths, property)
      const fullPathsLength = fullPaths.length
      const len = reactivePath.length
      let matched = false

      for (let i = 0; i < len; i++) {
        const parts = reactivePath[i].split('.')
        const innerLength = parts.length
        let isBreak = false

        if (fullPathsLength !== innerLength) break

        for (let j = 0; j < innerLength; j++) {
          if (parts[j] !== fullPaths[j]) {
            isBreak = true
            break;
          }
        }

        if (!isBreak) {
          matched = true
          break;
        }
      }

      if (matched) {
        central.register({ paths, comp, property })
      }
    } else if (target.hasOwnProperty(property)) { // eslint-disable-line
      central.register({ paths, comp, property })
    }

    if (shouldWrappedByProxy(originalValue)) {
      let nextValue
      const unobservable = originalValue
      if (type === '[object Object]') {
        nextValue = { ...unobservable }
      }

      if (type === '[object Array]') {
        nextValue = [...unobservable]
      }

      // 只要`useTracker`触发，就会执行`createHandler`操作，所以也就会有新的
      // Proxy对象创建
      const next = new Proxy(nextValue, createHandler(
        unobservable,
        comp,
        paths.concat(property),
        reactivePath
      ))
      Reflect.set(target, property, next, receiver)
    }

    return Reflect.get(target, property, receiver)
  },
})

function useTracker(fn, name, reactivePath = []) {
  const computation = new Computation(fn, name)
  const initialState = central.getCurrent()
  // Promise.resolve().then(() => central.flush())
  // setTimeout(() => central.flush(), 0)
  // 如果说这里面的target使用`initialState`的话，`initialState`相当于被各种覆盖
  // 所以一定要确保经过`createHeader`一系列操作以后，`initialState`要依旧只含`plain object`；
  // 不能够被`Proxy`污染
  return [
    new Proxy({}, createHandler(initialState, computation, [], reactivePath)),
    () => computation.markAsDirty(),
  ]
}

export default useTracker
