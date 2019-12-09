import Node from './Node'
import shallowEqual from './utils/shallowEqual'
import { isMutable, isTypeEqual } from './utils/ifType'
import infoLog from '../utils/infoLog'

const DEBUG = false
const REGISTER_DEBUG = false
const RECONCILE_PATHS_DEBUG = false

class Central {
  constructor() {
    this.stack = []
    this.collection = Object.create(null)
    this.node = new Node()
    this.currentCentralKey = 'default'
    this.pendingComputations = []
    this.willFlush = false
    this.currentComputation = null

    this.hitMap = {}
  }

  setCurrentComputation(computation) {
    this.currentComputation = computation
  }

  getPathValue(paths, obj) {
    return paths.reduce((acc, cur) => acc[cur], obj)
  }

  // 通过paths更新对应的`currentState`需要更新的数据
  setPathValue(paths, newValue, obj) {
    paths.reduce((acc, cur, index) => {
      if (index === paths.length - 1) acc[cur] = newValue
      return acc[cur]
    }, obj)
  }

  getPathNode(paths) {
    return paths.reduce((acc, cur) => {
      if (!acc.values[cur]) {
        acc.values[cur] = new Node(acc, cur)
      }
      return acc.values[cur]
    }, this.node)
  }

  register(options) {
    if (REGISTER_DEBUG) {
      infoLog('register : ', options.paths, options.comp, options.property)
    }
    this.stack.push(options)
  }

  setBase(value, namespace) {
    this.collection[namespace] = value
  }

  getCurrent(namespace) {
    return this.collection[namespace]
  }

  propagateChange(newValue, oldValue, node) {
    if (!shallowEqual(newValue, oldValue)) {
      // Update `mutable` object in `fine-grained` style
      if (isTypeEqual(newValue, oldValue) && isMutable(newValue)) {
        const values = node.values
        const keys = Object.keys(values)

        keys.forEach(key => {
          const nextNode = values[key]
          if (!nextNode) return
          const nextNewValue = newValue[key]
          const nextOldValue = oldValue[key]
          this.propagateChange(nextNewValue, nextOldValue, nextNode)
        })
      } else {
        node.depends.forEach(comp => {
          comp.markAsDirty()
          this.pendingComputations.push(comp)
        })
        if (DEBUG) {
          infoLog('updated node: ', node)
        }
        node.clear()
      }
    }
  }

  reconcileWithPaths(paths, newValue, namespace) {
    // 因为目前this.flush()是放置到`setTimout`中的，所以会存在应该`listen`的`path`
    // 此时此刻并没有被绑定到`deps`
    // if (this.willFlush) {
    //   this.flush()
    // }
    const node = this.getPathNode(paths)
    const currentState = this.getCurrent(namespace)
    const oldValue = this.getPathValue(paths, currentState)
    if (RECONCILE_PATHS_DEBUG) {
      infoLog('reconcile paths : ', paths)
    }
    this.propagateChange(newValue, oldValue, node)
    this.setPathValue(paths, newValue, currentState)

    // 触发autoRunFunction函数进行调用，从而进行数据层的更新
    this.pendingComputations.forEach(comp => comp.applyChange())
    this.pendingComputations = []
  }

  addDepends(paths, comp) {
    const node = this.getPathNode(paths)
    const removeDep = node.addDep(comp)
    comp.addOnEffectCallback(removeDep)
  }

  hitMapKey(paths) {
    if (paths.length) return paths.join('_')
    return ''
  }

  updateHitMap(paths) {
    paths.reduce((prev, cur) => {
      const nextPaths = [...prev, cur]
      const hitKey = this.hitMapKey(nextPaths)
      this.hitMap[hitKey] += 1
      return nextPaths
    }, [])
  }

  addDependsIfPossible(state) {
    const len = state.length
    if (!state.length) return

    for (let i = len - 1; i >= 0; i--) {
      const current = state[i]
      const { paths, property, comp } = current
      const mergedPaths = paths.concat(property)
      const hitKey = this.hitMapKey(mergedPaths)
      const hitValue = this.hitMap[hitKey] || 0

      if (!hitValue) {
        this.addDepends(mergedPaths, comp)
      }

      this.hitMap[hitKey] = Math.max(0, hitValue - 1)
    }
  }

  flush() {
    const focusedStack = this.stack
    this.stack = []
    this.hitMap = {}
    if (focusedStack.length) {
      this.addDependsIfPossible(focusedStack)
    }
  }
}

export default new Central()
