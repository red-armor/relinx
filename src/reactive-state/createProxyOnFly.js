import deepCopy from './utils/deepCopy'
import getPathValue from './utils/getPathValue'
import { IS_PROXY, IS_HEADING } from './symbol'

let counter = 0
const keyExtractor = () => `proxy_on_fly_${counter}`
const isObject = obj => typeof obj === 'object'
const toString = Function.call.bind(Object.prototype.toString)

export default function createProxyOnFly({
  key,
  registerOperation,
  initialState,
}) {
  let getTrapFromHeaderCount = 0
  this.listeners = []
  let onFlyProxyKey = key
  const that = this

  if (initialState) {
    if (toString(initialState) !== '[object Object]') {
      throw new Error('`initialState` should be an object')
    }
  }

  this._initialState = initialState || {}

  if (!onFlyProxyKey) {
    onFlyProxyKey = keyExtractor()
    counter += 1
  }

  this.onFlyProxyKey = onFlyProxyKey
  const stubKeyExtractor = () => `${this.onFlyProxyKey}_${getTrapFromHeaderCount}`
  const operationGenerator = (type, property, stub) => ({
    stub,
    type,
    property,
    onFlyProxyKey,
    stubKey: stubKeyExtractor(),
  })

  const reservedKeys = [
    'subscribe', 'update', 'onFlyProxyKey',
    IS_HEADING, IS_PROXY,
    'stub',
    Symbol.toStringTag,     // 目前如果说对proxy进行了toString操作，需要被过滤
  ]

  const createProxyHandler = () => ({
    get(target, property, receiver) {
      let nextProperty = property
      let shouldRegister = true

      if (typeof nextProperty === 'string' && nextProperty.endsWith('_without_register')) {
        shouldRegister = false
        nextProperty = nextProperty.replace('_without_register', '')
      }

      if (!initialState) {
        if (!target[nextProperty]) {
          const proxy = new Proxy({}, { get, set })
          proxy[IS_PROXY] = true
          proxy.stub = target.stub.concat(nextProperty)
          Reflect.set(target, nextProperty, proxy, receiver)
        }
      } else {
        // 只有在初始化的时候才会进行调用
        if (!target[nextProperty] && initialState[nextProperty]) {
          let value = initialState[nextProperty]
          if (isObject(value)) {
            value = new Proxy(deepCopy(value), { get, set })
            value[IS_PROXY] = true
            value.stub = target.stub.concat(nextProperty)
          }

          Reflect.set(target, nextProperty, value, receiver)
        }

        // 对子元素也进行相应的Proxy化，当前条件和上面的条件是互斥的
        if (isObject(target[nextProperty]) && !target[nextProperty][IS_PROXY]) {
          const proxy = new Proxy(target[nextProperty], { get, set })
          proxy[IS_PROXY] = true
          proxy.stub = target.stub.concat(nextProperty)
          Reflect.set(target, nextProperty, proxy, receiver)
        }
      }

      if (target[IS_HEADING]) {
        getTrapFromHeaderCount += 1
      }

      // 只有非保留的字段才会进行行为的注册
      if (reservedKeys.indexOf(nextProperty) === -1 && shouldRegister) {
        registerOperation(operationGenerator('get', nextProperty, target.stub), proxy)
      }

      return Reflect.get(target, nextProperty, receiver)
    },
    set(target, property, value, receiver) {
      const nextProperty = typeof property === 'string' ?
        `${property}_without_register` :
        property
      const oldValue = Reflect.get(target, nextProperty, receiver)

      if (reservedKeys.indexOf(property) === -1 && oldValue !== value) {
        notify()
      }

      Reflect.set(target, property, value, receiver)

      return true
    }
  })

  const subscribe = listener => {
    that.listeners.push(listener)

    return {
      unsubscribe: () => {
        const index = that.listeners.indexOf(listener)
        that.listeners.splice(index, 1)
      }
    }
  }

  const notify = () => {
    that.listeners.forEach(listener => listener())
  }

  const update = (operation) => {
    const { type, path, newValue } = operation
    if (type === 'set') {
      setValue(path, newValue)
    }
  }

  const setValue = (path, newValue) => {
    const len = path.length
    const paths = path.slice(0, -1)
    const last = path[len - 1]
    const final = getPathValue(proxy, paths, '_without_register')
    final[last] = newValue
  }

  const { get, set } = createProxyHandler()
  const proxy = new Proxy({}, { get, set })
  proxy[IS_HEADING] = true
  proxy[IS_PROXY] = true
  proxy.subscribe = subscribe
  proxy.update = update
  proxy.onFlyProxyKey = onFlyProxyKey
  proxy.stub = []
  return proxy
}
