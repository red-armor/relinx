import toString from '../../utils/toString'

const isObject = obj => toString(obj) === '[object Object]'
const isArray = obj => toString(obj) === '[object Array]'

const isMutable = obj => isObject(obj) || isArray(obj)
const isTypeEqual = (o1, o2) => toString(o1) === toString(o2)

export {
  isObject,
  isArray,
  isMutable,
  isTypeEqual,
}
