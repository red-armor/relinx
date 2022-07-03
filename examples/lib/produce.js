import { produce, Reaction } from 'state-tracker'

export default () => {
  const state = {
    app: {
      list: [{ id: 1, label: 'first' }],
      location: {
        city: 'shanghai',
      },
      title: 'current',
      description: 'testing',
    },
    bar: {
      count: 2,
    }
  };
  const proxyState = produce(state);

  const reaction = new Reaction({
    fn: function(state) {
      console.log('state ', state.app.list[0].id)
      console.log('location ', state.app.location.city)
      console.log('count ', state.bar.count)
    },
    state: proxyState,
  });

  console.log('reaction ', reaction.getAffectedPaths())

  isEqual()

  return null
}