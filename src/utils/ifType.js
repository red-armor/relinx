import toString from './toString'

const isPresent = o => typeof o !== 'undefined'
const isObject = obj => toString(obj) === '[object Object]'
const isArray = obj => toString(obj) === '[object Array]'

const isMutable = obj => isObject(obj) || isArray(obj)
const isTypeEqual = (o1, o2) => toString(o1) === toString(o2)

const isStrictEmptyObject = obj => {
  if (!isObject(obj)) return false

  for (const prop in obj) { // eslint-disable-line
    if (obj.hasOwnProperty(prop)) return false // eslint-disable-line
  }
  return true
}

const isStrictEmptyArray = arr => isArray(arr) && !arr.length

const hasEmptyItem = (...args) => (
  args.some(arg => isStrictEmptyArray(arg) || isStrictEmptyObject(arg))
)

export {
  isObject,
  isArray,
  isMutable,
  isTypeEqual,
  hasEmptyItem,
  isPresent,
}
