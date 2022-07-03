import { produce, Reaction, StateTrackerUtil } from 'state-tracker'

export default () => {
  const state = { a: { a1: 1, a2: 2, } }
  const proxyState = produce(state)

  let a1 = 0
  let count = 0

  const reaction = new Reaction({
    fn: (state) => {
      a1 = state.a.a1
      count++
    },
    // shallowEqual: false,
    state: proxyState
  })

  StateTrackerUtil.setValue(proxyState, {
    a: { a1: 1, a2: 2, }
  });

  const equal = StateTrackerUtil.isEqual(
    {a: { a1: 1, a2: 3, }},
    reaction
  )

  console.log('equal ', equal)

  console.log('count ', count)
  return null
}