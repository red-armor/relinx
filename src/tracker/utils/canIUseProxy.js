export default () => {
  try {
    new Proxy({}, {}) // eslint-disable-line
  } catch (err) {
    return false
  }

  return true
}