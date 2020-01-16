import invariant from 'invariant'
import Node from './Node'

class Application {
  constructor(currentState, dispatch) {
    this.currentState = currentState
    this.dispatch = dispatch
    this.node = new Node()
    this.pendingComputations = []
  }

  setDispatch(dispatch) {
    this.dispatch = dispatch
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

  // 通过paths更新对应的`currentState`需要更新的数据
  setPathValue(paths, newValue, obj) {
    paths.reduce((acc, cur, index) => {
      if (index === paths.length - 1) acc[cur] = newValue
      return acc[cur]
    }, obj)
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
    const currentState = this.currentState
    const oldValue = this.getPathValue(paths, currentState)
    if (RECONCILE_PATHS_DEBUG) {
      infoLog('reconcile paths : ', paths)
    }
    this.propagateChange(newValue, oldValue, node)
    this.setPathValue(paths, newValue, currentState)

    return this.pendingComputations
  }

}

export default Application