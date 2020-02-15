import { canIUseProxy, TRACKER } from './commons'
import context from './context'
import TrackerNode from './TrackerNode'
import invariant from 'invariant'

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
}) => {
  const assertAccessibility = (useScope, useRevoke) => {
    invariant(
      useRevoke !== useScope,
      '`useRevoke` or `useScope` should not be equal; and one must be true' +
      'If you do not have any idea, please leave to use default value.'
    )
  }

  assertAccessibility(useScope, useRevoke)

  const verifiedUseProxy = canIUseProxy() && useProxy
  const parentTrackerNode = typeof parent !== 'undefined' ? parent : context.trackerNode
  let isSibling = false

  // re-create a top most node
  if (!parentTrackerNode) {
    if (context.trackerNode) {
      useRevoke && context.trackerNode.revokeUntil(parentTrackerNode) // eslint-disable-line
    }
  } else {
    if (parentTrackerNode === context.trackerNode) {
      // Add the first child, for sibling, intersection access is forbidden.
      useRevoke && parentTrackerNode && parentTrackerNode.revokeLastChild() // eslint-disable-line
    } else {
      // add sibling, or create new branch....so `revokeUntil` is required.
      useRevoke && context.trackerNode && context.trackerNode.revokeUntil(parentTrackerNode) // eslint-disable-line
    }

    if (context.trackerNode && parentTrackerNode === context.trackerNode.parent) {
      isSibling = true
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
  })
}

export default Tracker
