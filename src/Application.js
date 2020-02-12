import invariant from 'invariant'
import PathNode from './PathNode'
import is from './utils/is'
import { isMutable, isTypeEqual, hasEmptyItem } from './utils/ifType'
import infoLog from './utils/infoLog'

import { generatePatcherId } from './utils/key'

const DEBUG = true

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

    if (DEBUG) {
      infoLog('[Application] top most node ', this.node)
    }

    values.forEach(value => this.treeShake(value))
    values.forEach(value => this.updateBase(value))

    if (DEBUG) {
      infoLog('[Application] pending patchers ', this.pendingPatchers)
    }

    if (this.pendingPatchers.length) {
      const patcherId = generatePatcherId({ namespace: this.namespace })
      this.pendingPatchers.forEach(({ patcher }) => patcher.triggerAutoRun(patcherId))
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
    console.log('change ', storeKey, changedValue, this.node)

    // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4
    if (!branch) return

    const compare = (branch, baseValue, nextValue, collections) => {
      if (is(baseValue, nextValue)) return

      // TODO, add description...only primitive type react...
      if (!isTypeEqual(baseValue, nextValue) || !isMutable(nextValue)) {
        if (branch.patchers.length) {
          branch.patchers.forEach(patcher => {
            this.pendingPatchers.push({ collections, patcher })
          })
          // delete should be placed after collection...
          // `branch.patchers` will be modified on `markDirty`..
          branch.patchers.forEach(patcher => patcher.markDirty())
        }
      }

      if (typeof nextValue === 'undefined') return

      const caredKeys = Object.keys(branch.children)
      let keysToCompare = caredKeys
      let keysToDestroy = []

      if (caredKeys.indexOf('length') !== -1) {
        const baseLength = baseValue.length
        const nextLength = nextValue.length
        if (nextLength < baseLength) {
          // return
          keysToCompare = caredKeys.filter(key => parseInt(key) < nextLength || key === 'length')
          keysToDestroy = caredKeys.filter(key => parseInt(key) >= nextLength)
        }
      }

      console.log('keys to process ', caredKeys, keysToCompare, keysToDestroy)

      keysToCompare.forEach(key => {
        const childBranch = branch.children[key]
        const childBaseValue = baseValue[key]
        const childNextValue = nextValue[key]
        compare(childBranch, childBaseValue, childNextValue, collections.concat(key))
      })

      keysToDestroy.forEach(key => {
        const childBranch = branch.children[key]
        console.log('branch to delete ', childBranch, childBranch.children)

        childBranch.destroy()

        // childBranch.destroy()
        // const childKeys = Object.keys(childBranch.children)

        // childKeys.forEach(childKey => childBranch.children[childKey].destroy())
      })

      // const caredKeys = Object.keys(branch.children)
      // caredKeys.forEach(key => {
      //   const childBranch = branch.children[key]
      //   const childBaseValue = baseValue[key]
      //   const childNextValue = nextValue[key]
      //   compare(childBranch, childBaseValue, childNextValue)
      // })
    }

    compare(branch, baseValue, nextValue, [storeKey])
  }

  addPatcher(patcher) {
    const paths = patcher.paths

    paths.forEach(fullPath => {
      console.log('add path node ', fullPath, patcher)
      this.node.addPathNode(fullPath, patcher)
    })

    console.log('node ---', this.node)
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

