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
}) => {
  const verifiedUseProxy = canIUseProxy() && useProxy
  const fn = verifiedUseProxy ? createTracker : createES5Tracker

  const node = new TrackerNode(context.trackerNode)
  context.trackerNode = node
  const tracker = fn(base, {}, context.trackerNode)

  node.tracker = tracker

  return node
}

export default Tracker