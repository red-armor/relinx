import { produce, Reaction, StateTrackerUtil } from 'state-tracker'

export default () => {
  const state = { app: { a1: 1, a2: 2 } };
  const data = { data: [{ title: 'first' }]}
  const proxyState = produce(state);
  const proxyData = produce(data)
  let count = 0

  new Reaction({
    fn: (state, props) => {
      console.log('a1 ', state.app.a1)
      console.log('title ', props.data[0].title);
      count++;
    },
    state: proxyState,
  }, proxyData);

  console.log('count1 ', count)   // 1
  StateTrackerUtil.setValue(
    proxyData, {
      data: [{ title: 'second' }]
    }
  )
  StateTrackerUtil.setValue(
    proxyState, {
      app: { a1: 2, a2: 2 }
    }
  )

  console.log('count2 ', count) // 1

  return null
}