// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy } from './commons'
import { createES5Tracker } from './es5'
import { createTracker } from './proxy'
import { generateRemarkablePaths } from './path'

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
const Tracker = ({
  base,
  autoRunFunc,
  useProxy = true,
}) => {
  const verifiedUseProxy = Tracker.isProxySupported && useProxy

  if (verifiedUseProxy) {
    return createTracker(base)
  }

  return createES5Tracker(base)
}

Tracker.isProxySupported = canIUseProxy()

const base = [4, 5, 6]

const tracker = createTracker(base)
for (let i = 0; i < tracker.length; i++) {
  const a = tracker[i]
}
const remarkable = generateRemarkablePaths(tracker.paths)
console.log('remarkable ', remarkable, tracker)

export default Tracker