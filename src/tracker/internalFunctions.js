import invariant from 'invariant'
import {
  isTrackable,
  TRACKER,
  updateDescriptorToHidden
} from './commons'
import { generateRemarkablePaths } from './path'
import { trackerNode as contextTrackerNode } from './context'

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

proto.assertLink = function(fnName) {
  const proxy = this
  const trackerNode = proxy.getProp('trackerNode')

  invariant(
    trackerNode,
    `You should not use \`${fnName}\` method with pure \`proxy\` object.\n` +
    'which should be bind with an `trackerNode` object'
  )

  invariant(
    contextTrackerNode !== trackerNode,
    `\`${fnName}\` method is used to update \`proxy\` object from upstream.\n` +
    'So it is not meaning to link proxy in current trackerNode scope'
  )
}

proto.reportAccessPath = function (path) {
  const proxy = this // eslint-disable-line
  const paths = proxy.getProp('paths')
  const parentProxy = proxy.getProp('parentProxy')
  paths.push(path)
  if (!parentProxy) return
  parentProxy.runFn('reportAccessPath', path)
}

proto.cleanup = function () {
  const proxy = this // eslint-disable-line
  proxy.setProp('paths', [])
  proxy.setProp('propProperties', [])
}

proto.unlink = function () {
  const proxy = this // eslint-disable-line
  return proxy.getProp('base')
}

proto.relink = function (path, baseValue) {
  try {
    this.runFn('assertLink', 'relink')

    const proxy = this // eslint-disable-line
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
    // infoLog('[proxy relink issue]', path, baseValue, err)
  }
}

proto.relinkProp = function (prop, newValue) {
  this.runFn('assertLink', 'relinkProp')

  const proxy = this // eslint-disable-line
  const base = proxy.getProp('base')
  const childProxies = proxy.getProp('childProxies')
  const accessPath = proxy.getProp('accessPath')

  if (Array.isArray(base)) {
    proxy.setProp('base', base.filter(v => v))
  }
  // proxy.setProp('base', )
  proxy.getProp('base')[prop] = newValue


  if (isTrackable(newValue)) {
    childProxies[prop] = proxy.createChild(newValue, {
      accessPath: accessPath.concat(prop),
      parentProxy: proxy,
    })
  }
}

proto.relinkBase = function (baseValue) {
  this.runFn('assertLink', 'rebase')
  this.runFn('rebase', baseValue)
}

proto.rebase = function (baseValue) {
  try {
    const proxy = this // eslint-disable-line
    proxy.setProp('base', baseValue)
  } catch (err) {
    // infoLog('[proxy] rebase ', err)
  }
}

proto.setRemarkable = function () {
  const proxy = this // eslint-disable-line
  const accessPath = proxy.getProp('accessPath')
  const parentProxy = proxy.getProp('parentProxy')
  if (!parentProxy) return false
  parentProxy.runFn('reportAccessPath', accessPath)
  return true
}

proto.getRemarkableFullPaths = function () {
  const proxy = this // eslint-disable-line
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

updateDescriptorToHidden(proto, 'reportAccessPath')
updateDescriptorToHidden(proto, 'cleanup')
updateDescriptorToHidden(proto, 'unlink')
updateDescriptorToHidden(proto, 'relink')
updateDescriptorToHidden(proto, 'relinkBase')
updateDescriptorToHidden(proto, 'relinkProp')
updateDescriptorToHidden(proto, 'setRemarkable')
updateDescriptorToHidden(proto, 'getRemarkableFullPaths')
updateDescriptorToHidden(proto, 'rebase')

export default internalFunctions
