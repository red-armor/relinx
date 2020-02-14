import { generateRemarkablePaths } from './path'

const peek = (proxy, accessPath) => { // eslint-disable-line
  return accessPath.reduce((proxy, cur) => {
    proxy.setProp('isPeeking', true)
    const nextProxy = proxy[cur]
    proxy.setProp('isPeeking', false)
    return nextProxy
  }, proxy)
}

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
  try {
    const proxy = this
    let copy = path.slice()
    let last = copy.pop()
    const len = path.length
    let nextBaseValue = baseValue

    // 修复 {a: { b: 1 }} => {a: {}} 时出现 nextBaseValue[key]为undefined
    for (let i = 0; i < len; i++) {
      const key = path[i]
      if (typeof nextBaseValue[key] !== 'undefined') {
        nextBaseValue = nextBaseValue[key]
      } else {
        copy = path.slice(0, i - 1)
        last = path[i - 1]

        break;
      }
    }
    const nextProxy = peek(proxy, copy)
    nextProxy.relinkProp(last, nextBaseValue)
  } catch (err) {
    infoLog('[proxy relink issue]', path, baseValue, err)
  }
}

proto.relinkProp = function(prop, newValue) {
  const proxy = this
  const base = proxy.getProp('base')
  // const childProxies = proxy.getProp('childProxies')
  // const rootPath = proxy.getProp('rootPath')
  // const accessPath = proxy.getProp('accessPath')

  if (Array.isArray(base)) {
    proxy.setProp('base', base.filter(v => v))
  }
  base[prop] = newValue

  if (isTrackable(newValue)) {
    // childProxies[prop] = createTracker(newValue, {
    //   // do not forget `prop` param
    //   accessPath: accessPath.concat(prop),
    //   parentTrack: proxy,
    //   rootPath,
    // }, trackerNode)
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
Object.defineProperty(proto, 'relinkProp', {
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