import internalFunctions from './internalFunctions'
import { inherit, Type, createHiddenProperty } from './commons'

let count = 0

function ProxyTracker({
  accessPath,
  parentProxy,
  rootPath,
  base,
}) {
  createHiddenProperty(this, 'id', `ProxyTracker_${count++}`) // eslint-disable-line

  createHiddenProperty(this, 'accessPath', accessPath)
  createHiddenProperty(this, 'rootPath', rootPath)
  createHiddenProperty(this, 'type', Array.isArray(base) ? Type.Array : Type.Object)
  createHiddenProperty(this, 'base', base)

  createHiddenProperty(this, 'parentProxy', parentProxy)
  createHiddenProperty(this, 'childProxies', {})

  createHiddenProperty(this, 'isPeekValue', false)
  createHiddenProperty(this, 'propProperties', [])
  createHiddenProperty(this, 'paths', [])
  // this.revoke = () => { isRevoked = true }
}

inherit(ProxyTracker, internalFunctions)

export default ProxyTracker
