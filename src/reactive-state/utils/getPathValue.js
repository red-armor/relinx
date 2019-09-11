/**
 * const data = { a: { b: { c: { f: 2 }}}}
 * const pickedUpValue = func(data, ['a', 'b', 'c'])
 * console.log(pickedUpValue)   // { f: 2 }
 */

import toString from './toString'

export default (obj, path, flag = '') => {
  if (toString(obj) !== '[object Object]') {
    throw new Error('`getPathValue` is only used for object')
  }

  return path.reduce((acc, cur) => acc[`${cur}${flag}`], obj)
}