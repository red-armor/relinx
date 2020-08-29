import infoLog from './utils/infoLog';

const DEBUG = false;

class PathNode {
  constructor(prop, parent) {
    this.prop = prop || 'root';

    this.parent = parent;
    this.children = {};
    this.patchers = [];
  }

  addPathNode(path, patcher) {
    const len = path.length;
    path.reduce((node, cur, index) => {
      // path中前面的值都是为了让我们定位到最后的需要关心的位置
      if (!node.children[cur]) node.children[cur] = new PathNode(cur, node);
      // 只有到达`path`的最后一个`prop`时，才会进行patcher的添加
      if (index === len - 1) {
        const childNode = node.children[cur];
        if (DEBUG) {
          infoLog('[PathNode add patcher]', childNode, patcher);
        }
        childNode.patchers.push(patcher);
        patcher.addRemover(() => {
          const index = childNode.patchers.indexOf(patcher);

          if (DEBUG) {
            infoLog('[PathNode remove patcher]', patcher.id, childNode);
          }
          if (index !== -1) {
            childNode.patchers.splice(index, 1);
          }
        });
      }
      return node.children[cur];
    }, this);
  }

  destroyPathNode() {
    try {
      this.patchers.forEach(patcher => patcher.destroyPatcher());

      if (this.children) {
        const childKeys = Object.keys(this.children);
        childKeys.forEach(key => {
          const pathNode = this.children[key];
          pathNode.destroyPathNode();
        });
      }

      if (this.parent) {
        delete this.parent.children[this.prop];
      }
    } catch (err) {
      infoLog('[PathNode destroy issue]', err);
    }
  }
}

export default PathNode;
