import { canIUseProxy } from './commons';
import context from './context';
import TrackerNode from './TrackerNode';
// import invariant from 'invariant';

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
const Tracker = ({
  base,
  parent,
  useProxy = true,
  useRevoke = false,
  useScope = true,
  rootPath = [],
}: {
  base: object;
  parent: null | TrackerNode;
  useProxy: boolean;
  useRevoke: boolean;
  useScope: boolean;
  rootPath: Array<string>;
}) => {
  // const assertAccessibility = (useScope: boolean, useRevoke: boolean) => {
  //   invariant(
  //     useRevoke !== useScope,
  //     '`useRevoke` or `useScope` should not be equal; and one must be true. ' +
  //       'If you do not have any idea, please leave to use default value.'
  //   );
  // };

  // assertAccessibility(useScope, useRevoke);

  const verifiedUseProxy = canIUseProxy() && useProxy;
  const parentTrackerNode =
    typeof parent !== 'undefined' ? parent : context.trackerNode;
  let isSibling = false;

  // re-create a top most node
  if (!parentTrackerNode) {
    // start another top level branch...like
    // { a: { b: 1 }} => { a: { b: 1 }, c: {d: 2 }}
    if (context.trackerNode && useRevoke) {
      context.trackerNode.revokeUntil();
    }
  } else {
    if (parentTrackerNode === context.trackerNode) {
      // Add a child, for sibling, intersection access is forbidden.
      if (useRevoke) {
        parentTrackerNode.revokeLastChild();
      }
    } else if (useRevoke && context.trackerNode) {
      // Add a parentTrackerNode's sibling, so `revokeUntil` is required.
      context.trackerNode.revokeUntil(parentTrackerNode);
    }

    if (
      context.trackerNode &&
      parentTrackerNode === context.trackerNode.parent
    ) {
      isSibling = true;
    }
  }

  return new TrackerNode({
    parent: parentTrackerNode,
    isSibling,
    base,
    useRevoke,
    useScope,
    useProxy: verifiedUseProxy,
    rootPath,
  });
};

export default Tracker;
