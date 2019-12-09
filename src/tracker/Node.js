class Node {
  constructor(parent, property) {
    this.parent = parent
    this.property = property
    this.depends = new Set()
    this.values = {}
  }

  get(key) {
    if (!this.values[key]) {
      this.values[key] = new Node(this)
    }

    return this.values[key]
  }

  addDep(comp) {
    this.depends.add(comp)
    return () => {
      this.depends.delete(comp)
      this.unMountIfNecessary()
    }
  }

  clear() {
    const keys = Object.keys(this.values)

    keys.forEach(key => {
      const node = this.values[key]
      if (node) {
        node.depends.forEach(comp => comp.clear())
        node.clear()
      }
    })
  }

  removeNode(node) {
    const property = node.property
    delete this.values[property]
    this.unMountIfNecessary()
  }

  unMountIfNecessary() {
    if (this.shouldNodeUnmount() && this.parent) {
      this.parent.removeNode(this)
    }
  }

  shouldNodeUnmount() {
    return !this.depends.size && !Object.keys(this.values).length
  }
}

export default Node
