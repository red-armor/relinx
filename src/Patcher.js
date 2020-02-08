import { generatePatcherKey } from './utils/key'

class Patcher {
  constructor({
    storeName,
    paths,
    autoRunFn,
  }) {
    this.autoRunFn = autoRunFn
    this.storeName = storeName
    this.paths = paths

    this.teardown = []
    this.dirty = false
    this.id = null
  }

  teardown() {

  }
}

export default Patcher