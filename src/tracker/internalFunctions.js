import { TRACKER, createHiddenProperty } from './commons'
import { generateRemarkablePaths } from './path'

function internalFunctions() {}
const proto = internalFunctions.prototype

proto.reportAccessPath = function(path) {
  const proxy = this
  const paths = proxy.getProp('paths')
  const parentProxy = proxy.getProp('parentProxy')
  paths.push(path)
  if (!parentProxy) return
  parentProxy.runFn('reportAccessPath', path)
}

proto.cleanup = function() {
  const proxy = this
  proxy.setProp('paths', [])
  proxy.setProp('propProperties', [])
}

proto.unlink = function () {
  const proxy = this // eslint-disable-line
  return proxy.getProp('base')
}

proto.relink = function(path, baseValue) {
  const proxy = this
  const copy = path.slice()
  const last = copy.pop()
  const nextProxy = peek(proxy, copy)
  const nextBaseValue = path.reduce((baseValue, cur) => baseValue[cur], baseValue)

  const base = nextProxy.getProp('base')
  const childProxies = nextProxy.getProp('childProxies')
  const rootPath = proxy.getProp('rootPath')

  base[last] = nextBaseValue
  if (isTrackable(nextBaseValue)) {
    childProxies[last] = createES5Tracker(nextBaseValue, {
      // do not forget `prop` param
      accessPath: path,
      parentProxy: nextProxy,
      rootPath,
    }, trackerNode)
  }
}

proto.rebase = function(baseValue) {
  try {
    const proxy = this
    proxy.setProp('base', baseValue)
  } catch(err) {
    infoLog('[proxy] rebase ', err)
  }
}

proto.setRemarkable = function () {
  const proxy = this
  const accessPath = proxy.getProp('accessPath')
  const parentProxy = proxy.getProp('parentProxy')
  if (!parentProxy) return false
  parentProxy.runFn(reportAccessPath, accessPath)
  return true
}

proto.getRemarkableFullPaths = function() {
  const proxy = this
  const paths = proxy.getProp('paths')
  const propProperties = proxy.getProp('propProperties')
  const rootPath = proxy.getProp('rootPath')
  const internalPaths = generateRemarkablePaths(paths)
    .map(path => rootPath.concat(path))
  const external = propProperties.map(prop => {
    const { path, source } = prop
    const sourceRootPath = source.getProp('rootPath')
    return sourceRootPath.concat(path)
  })
  const externalPaths = generateRemarkablePaths(external)
  return internalPaths.concat(externalPaths)
}

Object.defineProperty(proto, 'reportAccessPath', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'cleanup', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'unlink', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'relink', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'setRemarkable', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'getRemarkableFullPaths', {
  enumerable: false,
  configurable: false,
})
Object.defineProperty(proto, 'rebase', {
  enumerable: false,
  configurable: false,
})

export default internalFunctions