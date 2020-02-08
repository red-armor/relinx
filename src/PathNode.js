class PathNode {
  constructor(name, parent) {
    this.name = name || 'root'

    this.parent = parent
    this.children = {}
    this.patchers = []
  }

  addPathNode(path, patcher) {
    const len = path.length
    path.reduce((node, cur, index) => {
      if (index === len - 1) {
        this.patchers.push(patcher)
        patcher.addRemover(() => {
          const index = this.patchers.indexOf(patcher)
          this.patchers.splice(index, 1)
        })
      }

      if (!node.children[cur]) {
        node.children[cur] = new PathNode(cur, this)
      }

      return node.children[cur]
    }, this)
  }
}

export default PathNode