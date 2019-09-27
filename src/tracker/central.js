import Node from './Node'

const shallowEqual = (a, b) => {
  return a === b
}

class Central {
  constructor() {
    this.stack = []
    this.collection = Object.create(null)
    this.node = new Node()
    this.currentCentralKey = 'default'
    this.pendingComputations = []
    this.willFlush = false
  }

  getPathNode(paths) {
    return paths.reduce((acc, cur) => {
      if (!acc.values[cur]) {
        acc.values[cur] = new Node(acc, cur)
      }
      return acc.values[cur]
    }, this.node)
  }

  getPathValue(paths, obj) {
    return paths.reduce((acc, cur) => acc[cur], obj)
  }

  setPathValue(paths, newValue, obj) {
    paths.reduce((acc, cur, index) => {
      if (index === paths.length - 1) acc[cur] = newValue
      return acc[cur]
    }, obj)
  }

  requireFlush() {
    setTimeout(() => this.flush(), 0)
  }

  register(options) {
    if (!this.willFlush) {
      this.requireFlush()
      this.willFlush = true
    }
    this.stack.push(options)
  }

  setBase(value, key = 'default') {
    this.use(key)
    this.collection[this.currentCentralKey] = value
  }

  use(key) {
    if (key !== this.currentCentralKey) this.currentCentralKey = key
  }

  getCurrent() {
    const key = this.currentCentralKey || 'default'
    return this.collection[key]
  }

  propagateChange(newValue, oldValue, node) {
    if (!shallowEqual(newValue, oldValue)) {
      node.depends.forEach(comp => {
        comp.markAsDirty()
        this.pendingComputations.push(comp)
      })
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

  reconcileWithPaths(paths, newValue) {
    // 因为目前this.flush()是放置到`setTimout`中的，所以会存在应该`listen`的`path`
    // 此时此刻并没有被绑定到`deps`
    if (this.willFlush) {
      this.flush()
    }
    const node = this.getPathNode(paths)
    const currentState = this.getCurrent()
    const oldValue = this.getPathValue(paths, currentState)
    this.propagateChange(newValue, oldValue, node)
    this.setPathValue(paths, newValue, currentState)
    this.pendingComputations.forEach(comp => comp.applyChange())
    this.pendingComputations = []
  }

  addDepends(paths, comp) {
    const node = this.getPathNode(paths)
    const removeDep = node.addDep(comp)
    comp.addOnEffectCallback(removeDep)
  }

  addDependsIfPossible(state) {
    const current = state.shift()
    if (!current) return
    const { paths, property, comp } = current
    paths.forEach(key => {
      const index = state.findIndex(({ property }) => property === key)

      if (index !== -1) {
        const { hit = 0 } = state[index]
        state[index].hit = hit + 1
      }
    })

    if (!current.hit) {
      this.addDepends(paths.concat(property), comp)
    }

    if (state.length) this.addDependsIfPossible(state)
  }

  flush() {
    const reversedStack = this.stack.slice().reverse()
    this.stack = []
    this.addDependsIfPossible(reversedStack)
    this.willFlush = false
  }
}

export default new Central()