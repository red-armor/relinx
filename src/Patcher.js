class Patcher {
  constructor({
    storeName,
    paths,
    autoRunFn,
    key,
  }) {
    this.autoRunFn = autoRunFn
    this.storeName = storeName
    this.paths = paths

    this.removers = []
    this.dirty = false
    this.id = key
  }

  addRemover(remover) {
    this.removers.push(remover)
  }

  teardown() {
    this.removers.forEach(remover => remover())
  }

  markDirty() {
    this.teardown()
  }

  triggerAutoRun() {
    if (typeof this.autoRunFn === 'function')
      this.autoRunFn()
  }
}

export default Patcher