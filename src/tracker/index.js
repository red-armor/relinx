// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy, TRACKER } from './commons'
import { createES5Tracker } from './es5'
import { createTracker } from './proxy'
import context from './context'
import TrackerNode from './TrackerNode'

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
const Tracker = ({
  base,
  useProxy = true,
  parent,
}) => {
  const verifiedUseProxy = canIUseProxy() && useProxy
  const fn = verifiedUseProxy ? createTracker : createES5Tracker
  const parentTrackerNode = typeof parent !== 'undefined' ? parent : context.trackerNode
  let isSibling = false

  // re-create a top most node
  if (!parentTrackerNode) {
    if (context.trackerNode) {
      context.trackerNode.revokeUntil(parentTrackerNode)
    }
  } else {
    if (!context.trackerNode) throw new Error(
      'Maybe you are assign an invalid `parent`, which should define first'
    )

    if (parentTrackerNode === context.trackerNode) {
      // Add the first child, for sibling, intersection access is forbidden.
      parentTrackerNode.revokeLastChild()
    } else {
      // add sibling, or create new branch....so `revokeUntil` is required.
      context.trackerNode.revokeUntil(parentTrackerNode)
    }

    if (parentTrackerNode === context.trackerNode.parent) {
      isSibling = true
    }
  }

  const node = new TrackerNode(parentTrackerNode, isSibling)
  context.trackerNode = node
  const tracker = fn(base, {}, context.trackerNode)

  node.tracker = tracker

  return node
}

export default Tracker