export default obj => {
  const type = Object.prototype.toString.call(obj)

  const types = ["[object Array]", "[object Object]"]

  if (types.indexOf(type) !== -1) {
    return true
  }

  return false
}
