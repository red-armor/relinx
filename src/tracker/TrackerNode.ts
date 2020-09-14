import context from './context';
import createES5Tracker from './es5';
import createTracker from './proxy';

import {
  HydrateConfig,
  IProxyTracker,
  IES5Tracker,
  TrackerNodeConstructorProps,
} from './types';

let count = 0;

class TrackerNode {
  public base: object;
  public useRevoke: boolean;
  public useScope: boolean;
  public useProxy: boolean;
  public rootPath: Array<string>;
  public children: Array<any>;
  public parent: null | TrackerNode;
  public prevSibling: null | TrackerNode;
  public nextSibling: null | TrackerNode;
  public proxy: null | IProxyTracker | IES5Tracker;
  public id: string;
  public isRevoked: boolean;
  public inScope: boolean;

  constructor({
    parent,
    isSibling,
    base,
    useRevoke,
    useScope,
    useProxy,
    rootPath,
  }: TrackerNodeConstructorProps) {
    this.base = base;
    this.useRevoke = useRevoke;
    this.useScope = useScope;
    this.useProxy = useProxy;

    this.rootPath = rootPath || [];

    this.children = [];
    this.parent = parent;
    this.prevSibling = null;
    this.nextSibling = null;
    this.proxy = null;
    this.id = `__TrackerNode_${count++}__` // eslint-disable-line
    this.isRevoked = false;

    this.inScope = false;

    this.updateParent();
    if (isSibling) {
      this.initPrevSibling();
    }

    if (this.base) {
      this.enterTrackerScope();
    }
  }

  updateParent() {
    if (this.parent) {
      this.parent.children.push(this);
    }
  }

  enterTrackerScope() {
    this.enterContext();
    const fn = this.useProxy ? createTracker : createES5Tracker;
    this.proxy = fn(
      this.base,
      {
        useRevoke: this.useRevoke,
        useScope: this.useScope,
        rootPath: this.rootPath,
      },
      this
    );
  }

  enterContext() {
    context.trackerNode = this;
    this.inScope = true;
  }

  leaveContext() {
    if (this.inScope) {
      this.inScope = false;
      context.trackerNode = null;
    }

    if (this.parent && this.parent.inScope) {
      context.trackerNode = this.parent;
    }
  }

  initPrevSibling() {
    if (this.parent) {
      const childNodes = this.parent.children;
      const lastChild = childNodes[childNodes.length - 1];
      this.prevSibling = lastChild;
      if (lastChild) {
        lastChild.nextSibling = this;
      }
    }
  }

  destroy() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
    }
    const prev = this.prevSibling;
    const next = this.nextSibling;

    if (prev) {
      if (next) prev.nextSibling = next;
      else prev.nextSibling = null;
    }

    if (next) {
      if (prev) next.prevSibling = prev;
      else next.prevSibling = null;
    }
  }

  contains(childNode: TrackerNode): boolean {
    if (childNode === this) return true;
    if (!childNode) return false;
    const parent = childNode.parent;
    if (!parent) return false;
    if (parent === this) return true;
    return this.contains(parent);
  }

  revokeLastChild() {
    if (this.children.length) {
      this.children[this.children.length - 1].revoke();
    }
  }

  /**
   *
   * @param {null | TrackerNode} parent, null value means revoke until to top most.
   */
  revokeUntil(parent?: TrackerNode): boolean {
    if (parent === this) return true;

    if (parent) {
      if (parent.isRevoked)
        throw new Error('Assign a `revoked` parent is forbidden');
    }

    if (this.parent) {
      // if (!parent) throw new Error('parent should exist')

      // the top most node, still can not find `parent` node
      // if (!this.parent) throw new Error('`parent` is not a valid `TrackerNode`')
      if (this.parent) {
        return this.parent.revokeUntil(parent);
      }
    }

    return this.revokeSelf();
  }

  revokeSelf(): boolean {
    if (this.children.length) {
      this.children.forEach(child => {
        if (!child.isRevoked) child.revokeSelf();
      });
    }
    if (!this.isRevoked) {
      this.proxy?.revoke();
      this.isRevoked = true;
    }
    return true;
  }

  /**
   * return context handler to parent node.
   */
  revoke() {
    if (this.parent) {
      this.proxy?.revoke();
      context.trackerNode = this.parent;
    }
  }

  hydrate(base: object, config: HydrateConfig = {}) {
    this.base = base || this.base;
    const keys = Object.keys(config || ({} as HydrateConfig));
    // Object.keys always return 'string[]', So it need to
    // convert explicitly
    // https://stackoverflow.com/a/52856805/2006805
    (keys as Array<keyof HydrateConfig>).forEach(key => {
      // @ts-ignore
      this[key] = config[key];
    });
    this.enterTrackerScope();
  }
}

export default TrackerNode;
