// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy, TRACKER } from './commons'
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
  const verifiedUseProxy = canIUseProxy() && useProxy
  console.log('can i use ', canIUseProxy)

  if (verifiedUseProxy) {
    return createTracker(base)
  }

  return createES5Tracker(base)
}

export default Tracker