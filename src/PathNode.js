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
      // path中前面的值都是为了让我们定位到最后的需要关心的位置
      if (!node.children[cur]) node.children[cur] = new PathNode(cur, node)
      // 只有到达`path`的最后一个`prop`时，才会进行patcher的添加
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