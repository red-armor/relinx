let count = 1
import context from './context'

class TrackerNode {
  constructor(parent, isSibling) {
    this.children = []
    this.parent = parent
    this.prevSibling = null
    this.nextSibling = null
    this.tracker = null
    this.id = `__TrackerNode_${count++}__`

    this.updateParent()
    console.log('is ', isSibling)
    if (isSibling) {
      this.initPrevSibling()
    }
  }

  updateParent() {
    if (this.parent) {
      this.parent.children.push(this)
    }
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

  revokeLastChild() {
    if (this.children.length) {
      this.children[this.children.length - 1].revoke()
    }
  }

  revokeUntil(parent) {
    console.log('revoke this ', this)
    if (parent === this) return true
    if (!parent) throw new Error('parent should exist')
    // the top most node, still can not find `parent` node
    if (!this.parent) throw new Error('`parent` is not a valid `TrackerNode`')
    this.tracker.revoke()
    this.parent.revokeUntil(parent)
  }

  /**
   * return context handler to parent node.
   */
  revoke() {
    if (this.parent) {
      this.tracker.revoke()
      context.trackerNode = this.parent
    }
  }
}

export default TrackerNode