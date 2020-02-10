class PathNode {
  constructor(prop, parent) {
    this.prop = prop || 'root'

    this.parent = parent
    this.children = {}
    this.patchers = []
  }

  addPathNode(path, patcher) {
    const len = path.length
    path.reduce((node, cur, index) => {
      if (!node.children[cur]) node.children[cur] = new PathNode(cur, node)
      if (index === len - 1) {
        const childNode = node.children[cur]
        childNode.patchers.push(patcher)
        patcher.addRemover(() => {
          const index = childNode.patchers.indexOf(patcher)
          childNode.patchers.splice(index, 1)
        })
      }
      return node.children[cur]
    }, this)
  }
}

export default PathNode