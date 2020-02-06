const toString = Function.call.bind(Object.prototype.toString)

export const canIUseProxy = () => {
  try {
    new Proxy({}, {}) // eslint-disable-line
  } catch (err) { return false }

  return true
}

export const hasOwnProperty = (o, prop) => o.hasOwnProperty(prop)

export const isTrackable = o => {
  return [
    '[object Object]',
    '[object Array]',
  ].indexOf(toString(o)) !== -1
}

export const emptyFunction = () => {}