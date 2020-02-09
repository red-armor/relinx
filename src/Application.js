import invariant from 'invariant'
import PathNode from './PathNode'
import is from './utils/is'
import { isMutable, isTypeEqual, hasEmptyItem } from './utils/ifType'

import { generatePatcherId } from './utils/key'

class Application {
  constructor({ base, namespace }) {
    this.base = base
    this.node = new PathNode()
    this.pendingPatchers =[]
    this.namespace = namespace
  }

  blame() {}

  update(values) {
    this.pendingPatchers = []
    values.forEach(value => this.treeShake(value))
    values.forEach(value => this.updateBase(value))

    console.log('pending ', this.pendingPatchers)

    if (this.pendingPatchers.length) {
      const patcherId = generatePatcherId({ namespace: this.namespace })
      this.pendingPatchers.forEach(patcher => patcher.triggerAutoRun(patcherId))
    }
  }

  updateBase({ storeKey, changedValue }) {
    const origin = this.base[storeKey]
    this.base[storeKey] = { ...origin, ...changedValue }
  }

  treeShake({ storeKey, changedValue }) {
    const branch = this.node.children[storeKey]
    const baseValue = this.base[storeKey]
    const nextValue = { ...baseValue, ...changedValue }

    // console.log('node ', this.node, baseValue, nextValue)

    const compare = (branch, baseValue, nextValue) => {
      if (is(baseValue, nextValue)) return

      // TODO, add description...only primitive type react...
      if (!isTypeEqual() || !isMutable(nextValue)) {
        if (branch.patchers.length) {
          branch.patchers.forEach(patcher => {
            patcher.markDirty()
            this.pendingPatchers.push(patcher)
          })
        }
      }

      const caredKeys = Object.keys(branch.children)
      caredKeys.forEach(key => {
        const childBranch = branch.children[key]
        const childBaseValue = baseValue[key]
        const childNextValue = nextValue[key]
        compare(childBranch, childBaseValue, childNextValue)
      })
    }

    compare(branch, baseValue, nextValue)
  }

  addPatcher(patcher) {
    const storeName = patcher.storeName
    const paths = patcher.paths

    paths.forEach(path => {
      const fullPath = [storeName].concat(path)
      this.node.addPathNode(fullPath, patcher)
    })
  }

  getStoreData(storeName) {
    const storeValue = this.base[storeName]

    // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
    invariant(
      !!storeValue,
      `Invalid storeName '${storeName}'.` +
      'Please ensure `base[storeName]` return non-undefined value '
    )

    return storeValue
  }
}

export default Application