import ProxyPolyfill from './index'

const obj = {
  a: 1,
  b: 2,
}

const proxyObj = new ProxyPolyfill(obj)

console.log('proxy  object ', proxyObj)

const arr = [{
  a: 1,
}, {
  b: 2,
}]
const arrProxy = new ProxyPolyfill(arr)

console.log('proxy array ', arrProxy)
arrProxy.forEach(a => console.log(a))

const arr2 = [1, 2, [3, 4, [5, 6]]];
const arr2Proxy = new ProxyPolyfill(arr2)
console.log('flat : ', arr2Proxy, arr2Proxy.flat())

