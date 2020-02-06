export const generateAccessPath = paths => {
  const len = paths.length

  for (let i = len - 1; i >= 0; i--) {
    const current = paths[i]
    const {
      paths, property, comp, namespace,
    } = current
    const mergedPaths = paths.concat(property)
    const hitKey = this.hitMapKey(mergedPaths)
    const hitValue = this.hitMap[hitKey] || 0

    if (!hitValue) {
      this.addDepends(mergedPaths, comp, namespace)
    }

    this.hitMap[hitKey] = Math.max(0, hitValue - 1)
  }
}