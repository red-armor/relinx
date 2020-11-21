import infoLog from './utils/infoLog';
import Patcher from './Patcher';
import AutoRunner from './AutoRunner';

const DEBUG = false;

type Children = {
  [key: string]: PathNode;
};

type ToHandlerMap<T> = T extends Field.Patchers ? Patcher : AutoRunner;

enum Field {
  Patchers = 'patchers',
  AutoRunners = 'autoRunners',
}

class PathNode {
  private parent: PathNode | undefined;
  public patchers: Array<Patcher>;
  public autoRunners: Array<AutoRunner>;
  public children: Children;
  private prop: string;
  private _type: string;

  constructor({
    prop,
    parent,
    type,
  }: {
    prop?: string;
    parent?: PathNode;
    type: string;
  }) {
    this.prop = typeof prop === 'undefined' ? 'root' : prop;
    this._type = type;

    this.parent = parent;
    this.children = {};
    this.patchers = [];
    this.autoRunners = [];
  }

  getType() {
    return this._type;
  }

  addPatcher(path: Array<string>, patcher: Patcher) {
    this.addPathNode(path, patcher, Field.Patchers);
  }

  destroyPatcher() {}

  addAutoRunner(path: Array<string>, autoRunner: AutoRunner) {
    this.addPathNode(path, autoRunner, Field.AutoRunners);
  }

  destroyAutoRunner() {}

  getCollection<T extends Field>(field: T): Array<Patcher> | Array<AutoRunner> {
    if (field === Field.Patchers) {
      return this.patchers;
    }
    return this.autoRunners;
  }

  addPathNode<T extends Field>(
    path: Array<string>,
    handler: ToHandlerMap<T>,
    field: T
  ) {
    try {
      const len = path.length;
      path.reduce<PathNode>((node: PathNode, cur: string, index: number) => {
        // path中前面的值都是为了让我们定位到最后的需要关心的位置
        if (!node.children[cur])
          node.children[cur] = new PathNode({
            type: this._type,
            prop: cur,
            parent: node,
          });
        // 只有到达`path`的最后一个`prop`时，才会进行patcher的添加
        if (index === len - 1) {
          const childNode = node.children[cur];
          if (DEBUG) {
            infoLog('[PathNode add handler]', childNode, handler);
          }
          const collection = childNode.getCollection(field) as Array<
            ToHandlerMap<T>
          >;

          if (collection) {
            collection.push(handler);
            handler.addRemover(() => {
              const index = collection.indexOf(handler);

              if (DEBUG) {
                infoLog('[PathNode remove handler]', handler.id, childNode);
              }
              if (index !== -1) {
                collection.splice(index, 1);
              }
            });
          }
        }
        return node.children[cur];
      }, this);
    } catch (err) {
      // console.log('err ', err)
    }
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
