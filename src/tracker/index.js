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

const base = [{
  a: 1,
}, {
  b: 2
}]
const copy = base

const nest = {
  e: 3,
  f: 4,
}

const copyNode = Tracker({ base: copy, useProxy: true })
const nestNode = Tracker({ base: nest, useProxy: true })

const prop = copyNode.tracker[0]
console.log('prop ', prop)
copyNode.tracker.relink('0', { ...base[0], a: 4 })
console.log('after -----')

console.log('copy node ', copyNode, prop.a)

export default Tracker