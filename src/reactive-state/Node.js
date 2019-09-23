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

  removeNode(node) {
    const property = node.property
    delete this.values[property]
    this.unMountIfNecessary()
  }

  unMountIfNecessary() {
    console.log('this.shouldNodeUmmount() : ', this.shouldNodeUmmount())
    if (this.shouldNodeUmmount() && this.parent) {
      this.parent.removeNode(this)
    }
  }

  shouldNodeUmmount() {
    return !this.depends.size && !Object.keys(this.values).length
  }
}

export default Node