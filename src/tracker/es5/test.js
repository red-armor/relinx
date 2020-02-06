import { createES5Tracker } from './index'

const obj = {
  a: 1,
  b: 2,
}

const proxyObj = createES5Tracker(obj)

console.log('proxy  object ', proxyObj)

const arr = [{
  a: 1,
}, {
  b: 2,
}]
const arrProxy = createES5Tracker(arr)

console.log('proxy array ', arrProxy)
arrProxy.forEach(a => console.log(a))

const arr2 = [1, 2, [3, 4, [5, 6]]];
const arr2Proxy = createES5Tracker(arr2)
console.log('flat : ', arr2Proxy, arr2Proxy.flat())

