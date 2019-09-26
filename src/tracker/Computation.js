let id = 0

// TODO: computation with namespace

class Computation {
  constructor(fn, name) {
    this.autoRunFunction = fn
    this.onEffectCallback = []
    this.id = id++
    this.name = name
    this.dirty = false
  }

  markAsDirty() {
    this.onEffectCallback.forEach(callback => callback())
    this.onEffectCallback = []
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
}

export default Computation