import toString from './toString'

function deepCopy(obj) {
  const keys = Object.keys(obj)
  const result = {}

  keys.forEach(key => {
    const value = obj[key]

    if (toString(value) === '[object Object]') {
      result[key] = deepCopy(value)
    } else if (toString(value) === '[object Array]') {
      result[key] = value.slice()
    } else {
      result[key] = value
    }
  })

  return result
}

export default deepCopy