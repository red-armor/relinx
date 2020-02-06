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

const base = {
  a: 1,
  b: 2,
  c: {
    d: 3,
  }
}

const tracker = new Tracker({
  base,
})

console.log('tracker ', tracker.a, tracker.b)
console.log('tracker value ', tracker)
console.log('nest value ',  tracker.c.d)
console.log('nest value ', tracker.c.d)
console.log('tracker : ', tracker)

export default Tracker