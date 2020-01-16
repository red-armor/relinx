let id = 0

class Computation {
  constructor({
    autoRun,
    name,
    autoRunUpdated,
    pathNumber,
  }) {
    this.autoRunFunction = autoRun
    this.onEffectCallback = []
    this.id = id++ // eslint-disable-line
    this.name = name
    this.dirty = false
    this.autoRunUpdated = autoRunUpdated
    this.pathNumber = pathNumber
  }

  clear() {
    this.onEffectCallback.forEach(callback => callback())
    this.onEffectCallback = []
  }

  /**
   * First, clean up computation from connected node. then prepare to execute `autoFunction`
   */
  markAsDirty() {
    this.clear()
    this.dirty = true
  }

  /**
   * Execute autoRunFunction and reset `dirty` to false.
   */
  applyChange() {
    if (this.dirty) {
      this.autoRunFunction()
      this.dirty = false
    }
  }

  /**
   *
   * @param {Function} fn. Basically, `computation` will serve as `node` deps, when `computation`
   * is unmounted, it should be clean up from the connected node.
   */
  addOnEffectCallback(fn) {
    this.onEffectCallback.push(fn)
  }

  getValue() {
    return {
      id: this.id,
      name: this.name,
      pathNumber: this.pathNumber,
    }
  }
}

export default Computation
