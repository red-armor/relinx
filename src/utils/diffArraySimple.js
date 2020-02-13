export default (a = [], b = []) => {
  const parts = []

  for (let i = 0; i < a.length; i++) {
    const key = a[i]
    if (b.indexOf(key) === -1) {
      parts.push(key)
    }
  }

  return parts
}