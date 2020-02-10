class Patcher {
  constructor({
    storeName,
    paths,
    autoRunFn,
    key,
    parent,
  }) {
    this.autoRunFn = autoRunFn
    this.paths = paths

    this.removers = []
    this.dirty = false
    this.id = key
    this.parent = parent
    this.children = []

    if (this.parent) {
      this.parent.children.push(this)
    }
  }

  destroy() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index !== -1) this.children.splice(index, 1)
  }

  update({ paths, storeName }) {
    this.paths = paths
    this.dirty = false
    this.teardown()
  }

  addRemover(remover) {
    this.removers.push(remover)
  }

  teardown() {
    this.removers.forEach(remover => remover())
    this.removers = []
  }

  markDirty() {
    this.dirty = true
    this.teardown()

    // If parent is dirty, then its children should be all dirty...
    if (this.children.length) {
      this.children.forEach(child => child.markDirty())
    }
  }

  triggerAutoRun() {
    if (typeof this.autoRunFn === 'function')
      this.autoRunFn()
  }
}

export default Patcher