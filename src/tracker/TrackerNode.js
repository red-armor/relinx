let count = 1

class TrackerNode {
  constructor(parent) {
    this.children = []
    this.parent = parent
    this.prevSibling = this.initPrevSibling()
    this.nextSibling = null
    this.tracker = null
    this.id = `__TrackerNode_${count++}__`
  }

  initPrevSibling() {
    if (this.parent) {
      const childNodes = this.parent.children
      const lastChild = childNodes[childNodes.length - 1]
      this.prevSibling = lastChild
      if (lastChild) {
        lastChild.nextSibling = this
      }
    }
  }

  destroy() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this)
      this.parent.children.splice(index, 1)
    }
    const prev = this.prevSibling
    const next = this.nextSibling

    if (prev) {
      if (next) prev.nextSibling = next
      else prev.nextSibling = null
    }

    if (next) {
      if (prev) next.prevSibling = prev
      else next.prevSibling = null
    }
  }
}

export default TrackerNode