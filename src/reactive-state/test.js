import useTracker from './useTracker'
import central from './central'

export default () => {
  central.setBase({
    a: {c: {f: 4}},
    b: [2,3]
  })

  const state = useTracker(() => {
    console.log('trigger update')
  })

  const a = state.a.c.f
  const b = state.b

  console.log('state : ', state)

  console.log('a : ', a)
  console.log('b : ', b)

  // state.q.m = 3
  console.log('central : ', central)

  setTimeout(() => {
    central.reconcileWithPaths(['a', 'c', 'f'], '4')
    console.log('central : ', central)
  }, 0)
  return null
}