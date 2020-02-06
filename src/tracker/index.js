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

export default Tracker