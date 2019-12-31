let id = 0

// TODO: computation with namespace

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

  markAsDirty() {
    this.clear()
    this.dirty = true
  }

  applyChange() {
    if (this.dirty) {
      this.autoRunFunction()
      this.dirty = false
    }
  }

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
