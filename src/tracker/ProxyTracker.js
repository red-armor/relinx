import internalFunctions from './internalFunctions'
import { inherit, Type, createHiddenProperty } from './commons'

let count = 0

function ProxyTracker({
  accessPath,
  parentProxy,
  rootPath,
  base,
  trackerNode,
  useRevoke,
}) {
  createHiddenProperty(this, 'id', `ProxyTracker_${count++}`) // eslint-disable-line

  createHiddenProperty(this, 'trackerNode', trackerNode)
  createHiddenProperty(this, 'accessPath', accessPath)
  createHiddenProperty(this, 'rootPath', rootPath)
  createHiddenProperty(this, 'type', Array.isArray(base) ? Type.Array : Type.Object)
  createHiddenProperty(this, 'base', base)

  createHiddenProperty(this, 'parentProxy', parentProxy)
  createHiddenProperty(this, 'childProxies', {})

  createHiddenProperty(this, 'isPeeking', false)
  createHiddenProperty(this, 'propProperties', [])
  createHiddenProperty(this, 'paths', [])

  createHiddenProperty(this, 'useRevoke', useRevoke)
}

inherit(ProxyTracker, internalFunctions)

export default ProxyTracker
