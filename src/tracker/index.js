// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy, TRACKER } from './commons'
import context from './context'
import TrackerNode from './TrackerNode'

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
const Tracker = ({
  base,
  parent,
  useProxy = true,
  useRevoke = true,
  useScope = true,
}) => {
  const verifiedUseProxy = canIUseProxy() && useProxy
  const parentTrackerNode = typeof parent !== 'undefined' ? parent : context.trackerNode
  let isSibling = false

  // re-create a top most node
  if (!parentTrackerNode) {
    if (context.trackerNode) {
      useRevoke && context.trackerNode.revokeUntil(parentTrackerNode)
    }
  } else {
    if (!context.trackerNode) throw new Error(
      'Maybe you are assign an invalid `parent`, which should define first'
    )

    if (parentTrackerNode === context.trackerNode) {
      // Add the first child, for sibling, intersection access is forbidden.
      useRevoke && parentTrackerNode.revokeLastChild()
    } else {
      // add sibling, or create new branch....so `revokeUntil` is required.
      useRevoke && context.trackerNode.revokeUntil(parentTrackerNode)
    }

    if (parentTrackerNode === context.trackerNode.parent) {
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
  })
}

export default Tracker