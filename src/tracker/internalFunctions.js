function internalFunctions() {}

internalFunctions.prototype.reportAccessPath = function(path) {
  const proxy = this
  const tracker = proxy[TRACKER]
  tracker.paths.push(path)
  const parentTrack = tracker.parentTrack
  if (parentTrack) {
    parentTrack[TRACKER].reportAccessPath(path)
  }
}

internalFunctions.prototype.cleanup = function() {
  proxy[TRACKER].paths = []
  proxy[TRACKER].propertyFromProps = []
}

internalFunctions.prototype.unlink = function () {
  const proxy = this // eslint-disable-line
  const tracker = proxy[TRACKER]
  return tracker.base
}

internalFunctions.prototype.relink = function(path, baseValue) {
  const proxy = this
  const copy = path.slice()
  const last = copy.pop()
  const nextProxy = peek(proxy, copy)
  const nextBaseValue = path.reduce((baseValue, cur) => baseValue[cur], baseValue)

  const { base, proxy: proxyProps } = getInternalProp(nextProxy, ['base', 'proxy'])

  base[last] = nextBaseValue
  if (isTrackable(nextBaseValue)) {
    proxyProps[last] = createES5Tracker(nextBaseValue, {
      // do not forget `prop` param
      accessPath: path,
      parentTrack: nextProxy,
      rootPath,
    }, trackerNode)
  }
}

internalFunctions.prototype.setRemarkable = function () {
  const proxy = this
  const tracker = proxy[TRACKER]
  const parentTrack = tracker.parentTrack
  if (parentTrack) {
    parentTrack[TRACKER].reportAccessPath(tracker.accessPath)
    return true
  }
  return false
}

internalFunctions.prototype.getRemarkableFullPaths = function() {
  const { paths, propertyFromProps } = getInternalProp(proxy, ['paths', 'propertyFromProps'])

  const internalPaths = generateRemarkablePaths(paths).map(path => rootPath.concat(path))
  const external = propertyFromProps.map(prop => {
    const { path, source } = prop
    return source[TRACKER].rootPath.concat(path)
  })
  const externalPaths = generateRemarkablePaths(external)

  return internalPaths.concat(externalPaths)
}