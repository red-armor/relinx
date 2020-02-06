// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy } from './commons'
import { createES5Tracker } from './es5'
import { createTracker } from './proxy'

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

// const base = {
//   a: 1,
//   b: 2,
//   c: { d: 3 }
// }

// const tracker = Tracker({ base })

// console.log('tracker.a ', tracker.a)
// console.log('tracker.a ', tracker.b)
// console.log('tracker.a ', tracker.c)
// console.log('tracker.a ', tracker.c.d)
// console.log('tracker ', tracker)

export default Tracker