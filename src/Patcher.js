class Patcher {
	constructor({paths, autoRunFn, key, parent}) {
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

	destroyPatcher() {
		this.teardown()
		if (this.children.length) {
			this.children.forEach(child => child.destroyPatcher())
		}

		if (this.parent) {
			this.parent.removeChild(this)
		}
		this.parent = null
	}

	appendTo(parent) {
		if (this.parent) {
			this.parent.removeChild(this)
		}

		if (parent) {
			this.parent = parent

			if (parent.children.indexOf(this) === -1) {
				parent.children.push(this)
			}
		}
	}

	belongs(parent) {
		if (!parent) return false

		if (this.parent) {
			if (this.parent === parent) {
				return true
			}
			return this.parent.belongs(parent)
		}

		return false
	}

	removeChild(child) {
		const index = this.children.indexOf(child)
		if (index !== -1) this.children.splice(index, 1)
	}

	update({paths}) {
		this.paths = paths
		this.dirty = false
		this.teardown()
	}

	addRemover(remover) {
		this.removers.push(remover)
	}

	// 将patcher从PathNode上删除
	teardown() {
		this.removers.forEach(remover => remover())
		this.removers = []
	}

	markDirty() {
		this.teardown()
	}

	markDirtyAll() {
		this.teardown()

		// If parent is dirty, then its children should be all dirty...
		if (this.children.length) {
			this.children.forEach(child => child.markDirtyAll())
		}
	}

	triggerAutoRun() {
		if (typeof this.autoRunFn === "function") this.autoRunFn()
	}
}

export default Patcher
