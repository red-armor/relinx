import invariant from 'invariant'
import Node from './Node'
import shallowEqual from '../utils/shallowEqual'
import { isMutable, isTypeEqual, hasEmptyItem } from '../utils/ifType'
import infoLog from '../utils/infoLog'

const REGISTER_DEBUG = false
const RECONCILE_PATHS_DEBUG = false
const DEBUG = false

class Application {
  constructor(state, dispatch) {
    this.state = state
    this.dispatch = dispatch
    this.node = new Node()
    this.pendingComputations = []

    this.stack = []
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
  }

  getPathValue(paths, obj) {
    return paths.reduce((acc, cur) => acc[cur], obj)
  }

  getPathNode(paths) {
    return paths.reduce((acc, cur) => {
      if (!acc.values[cur]) {
        acc.values[cur] = new Node(acc, cur)
      }
      return acc.values[cur]
    }, this.node)
  }

  addDepends(paths, comp) {
    const node = this.getPathNode(paths)
    const removeDep = node.addDep(comp)
    comp.addOnEffectCallback(removeDep)
  }

  // 通过paths更新对应的`state`需要更新的数据
  setPathValue(paths, newValue, obj) {
    paths.reduce((acc, cur, index) => {
      if (index === paths.length - 1) acc[cur] = newValue
      return acc[cur]
    }, obj)
  }

  register(options) {
    this.stack.push(options)
  }

  /**
   *
   * @param {any} newValue
   * @param {any} oldValue
   * @param {any} node
   */
  propagateChange(newValue, oldValue, node) {
    if (!shallowEqual(newValue, oldValue)) {
      const isSameTypeMutation = isTypeEqual(newValue, oldValue) && isMutable(newValue)

      if (!isSameTypeMutation || hasEmptyItem(newValue, oldValue)) {
        node.depends.forEach(comp => {
          comp.markAsDirty()
          this.pendingComputations.push(comp)
        })
        if (DEBUG) {
          if (hasEmptyItem(newValue, oldValue)) {
            infoLog('update node with empty item ', node, newValue, oldValue)
          } else {
            infoLog('updated node: ', node)
          }
        }
        node.clear()
        return
      }

      // Update `mutable` object in `fine-grained` style
      // TODO：这里只判断它的property值是否发生了变化，对于本身从null => {}；这种情况，有可能存在
      // autoRun丢失的问题
      if (isSameTypeMutation) {
        const values = node.values
        const keys = Object.keys(values)

        keys.forEach(key => {
          const nextNode = values[key]
          if (!nextNode) return
          const nextNewValue = newValue[key]
          const nextOldValue = oldValue[key]
          this.propagateChange(nextNewValue, nextOldValue, nextNode)
        })
      }
    }
  }

  reconcileWithPaths(paths, newValue) {
    this.pendingComputations = []
    const node = this.getPathNode(paths)
    const state = this.state
    const oldValue = this.getPathValue(paths, state)
    if (RECONCILE_PATHS_DEBUG) {
      infoLog('reconcile paths : ', paths)
    }
    this.propagateChange(newValue, oldValue, node)
    this.setPathValue(paths, newValue, state)

    return this.pendingComputations
  }

  hitMapKey(paths) {
    if (paths.length) return paths.join('_')
    return ''
  }

  addDependsIfPossible(state) {
    const len = state.length
    if (!state.length) return

    for (let i = len - 1; i >= 0; i--) {
      const current = state[i]
      const {
        paths, property, comp, namespace,
      } = current
      const mergedPaths = paths.concat(property)
      const hitKey = this.hitMapKey(mergedPaths)
      const hitValue = this.hitMap[hitKey] || 0

      if (!hitValue) {
        this.addDepends(mergedPaths, comp, namespace)
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

export default Application
