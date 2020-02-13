import invariant from 'invariant'
import PathNode from './PathNode'
import is from './utils/is'
import { isMutable, isTypeEqual, hasEmptyItem } from './utils/ifType'
import infoLog from './utils/infoLog'
import { isPresent, isObject } from './utils/ifType'
import diffArraySimple from './utils/diffArraySimple'
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
      infoLog('[Application] top most node ', this.node, this.base)
      infoLog('[Application] changed value ', values)
    }

    try {
      values.forEach(value => this.treeShake(value))
      values.forEach(value => this.updateBase(value))
    } catch(err) {
      infoLog('[Application] update issue ', err)
    }

    if (DEBUG) {
      infoLog('[Application] pending patchers ', this.pendingPatchers)
    }

    if (this.pendingPatchers.length) {
      const patcherId = generatePatcherId({ namespace: this.namespace })
      this.pendingPatchers.forEach(({ patcher, operation }) => {
        patcher.triggerAutoRun(patcherId)
      })
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

    // why it could be undefined. please refer to https://github.com/ryuever/relinx/issues/4
    if (!branch) return

    let toDestroy = []
    const compare = (branch, baseValue, nextValue, collections, operation) => {
      if (is(baseValue, nextValue)) return

      // TODO, add description...only primitive type react...
      if (!isTypeEqual(baseValue, nextValue) || !isMutable(nextValue)) {
        if (branch.patchers.length) {
          branch.patchers.forEach(patcher => {
            this.pendingPatchers.push({ collections, patcher, operation })
          })
          // delete should be placed after collection...
          // `branch.patchers` will be modified on `markDirty`..
          branch.patchers.forEach(patcher => patcher.markDirty())
        }
      }

      const caredKeys = Object.keys(branch.children)
      let keysToCompare = caredKeys
      let keysToDestroy = []
      const currentOperation = []

      // 处理，如果说array中的一项被删除了。。。。
      if (isTypeEqual(baseValue, nextValue) && Array.isArray(nextValue)) {
        const baseLength = baseValue.length
        const nextLength = nextValue.length

        if (nextLength < baseLength) {
          keysToCompare = caredKeys.filter(
            key => parseInt(key) < nextLength || key === 'length'
          )
          keysToDestroy = caredKeys.filter(key => {
            if (parseInt(key) >= nextLength) {
              currentOperation.push({
                path: collections.concat(key),
                isDelete: true,
              })
              return true
            }
            return false
          })
        }
      }

      if (isObject(nextValue) && isObject(baseValue)) {
        const nextKeys = Object.keys(nextValue)
        const prevKeys = Object.keys(baseValue)
        const removed = diffArraySimple(prevKeys, nextKeys)

        if (removed.length) {
          toDestroy.push((function(branch, removed) {
            removed.forEach(key => {
              const childBranch = branch.children[key]
              childBranch && childBranch.destroy()
            })
          }).bind(null, branch, removed))
        }
      }

      // console.log('key to compared ', keysToDestroy, keysToCompare, baseValue, nextValue)

      keysToCompare.forEach(key => {
        const childBranch = branch.children[key]
        const childBaseValue = baseValue[key]
        // 当时一个对象，并且key被删除的时候，那么它的值就是undefined
        const childNextValue = nextValue ? nextValue[key] : undefined

        compare(childBranch, childBaseValue, childNextValue, collections.concat(key), currentOperation)
      })

      if (keysToDestroy.length) {
        toDestroy.push((function(branch, keysToDestroy) {
          console.log('branch delete ', branch, keysToDestroy)
          keysToDestroy.forEach(key => {
            const childBranch = branch.children[key]
            childBranch && childBranch.destroy()
          })
        }).bind(null, branch, keysToDestroy))
      }
    }

    compare(branch, baseValue, nextValue, [storeKey], [])
    toDestroy.forEach(fn => fn())

    console.log('final ----', this.node)
  }

  addPatcher(patcher) {
    const paths = patcher.paths

    paths.forEach(fullPath => {
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

