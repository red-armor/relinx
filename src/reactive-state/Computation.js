let id = 0

class Computation {
  constructor(fn) {
    this.autoRunFunction = fn
    this.onEffectCallback = []
    this.id = id++
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