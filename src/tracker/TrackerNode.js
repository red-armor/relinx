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
    this.isRevoked = false

    this.updateParent()
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

  /**
   *
   * @param {null | TrackerNode} parent, null value means revoke until to top most.
   */
  revokeUntil(parent) {
    if (parent === this) return true

    if (parent) {
      if (parent.isRevoked) throw new Error('Assign a `revoked` parent is forbidden')
    }

    if (this.parent) {
      // if (!parent) throw new Error('parent should exist')

      // the top most node, still can not find `parent` node
      // if (!this.parent) throw new Error('`parent` is not a valid `TrackerNode`')
      if (this.parent) {
        this.parent.revokeUntil(parent)
      }
    }

    this.revokeSelf()
  }

  revokeSelf() {
    if (!this.isRevoked) {
      this.tracker.revoke()
      this.isRevoked = true
    }

    if (this.children.length) {
      this.children.forEach(child => {
        if (!child.isRevoked) child.revokeSelf()
      })
    }
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