import Subscription from './Subscription'
import toString from './utils/toString'
import { IS_PROXY, IS_HEADING } from './symbol'

export default obj => {
  const createDeepProxy = (obj, parentStub = []) => {
    const keys = Object.keys(obj)
    const result = {}

    keys.forEach(key => {
      const value = obj[key]

      if (typeof value !== 'object') {
        result[key] = value
        return
      }

      if (value[IS_PROXY]) return

      let proxy

      if (toString(value) !== '[object Object]') {
        proxy = createProxy(value)
        proxy.parentStub = [].concat(parentStub, key)
      } else {
        proxy = createDeepProxy(value, [].concat(parentStub, key))
      }

      result[key] = proxy
    })

    const proxy = createProxy(result)
    proxy.parentStub = parentStub

    return proxy
  }

  // 白驹过隙，到此一游
  // 如何给经过处理的属性增加上游的信息
  const createProxy = obj => {
    const proxy = new Proxy(obj, {
      get(target, property, receiver) {
        return Reflect.get(target, property, receiver)
      },

      set(target, property, newValue, receiver) {
        const reactivePath = (target.parentStub || []).concat(property)
        const oldValue = Reflect.get(target, property)
        subscriptions.notify(reactivePath, newValue, oldValue)
        Reflect.set(target, property, newValue, receiver)
        return true
      }
    })

    proxy[IS_PROXY] = true

    return proxy
  }

  const subscriptions = new Subscription()
  const state = createDeepProxy(obj)

  state[IS_HEADING] = true
  state.subscriptions = subscriptions
  state.initialState = obj
  return state
}
