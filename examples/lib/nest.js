import { produce, Reaction, StateTrackerUtil, observer } from 'state-tracker'


export default () => {
  const state = {
    app: {
      list: [
        { id: 1, label: 'first' },
        { id: 2, label: 'second' },
      ],
    },
  };

  const funcCache = new Map();
  const proxyState = produce(state);
  let runCount = 0;

  // @ts-ignore
  const fn = observer(proxyState, (state, props) => {
    const { app } = props;
    return app.list.forEach((item) => {
      const func = funcCache.has(item.id)
        ? funcCache.get(item.id)
        : funcCache
            .set(
              item.id,
              // @ts-ignore
              observer(proxyState, (state, props) => {
                const { item } = props;
                const { id } = item;
                runCount++;
                return `${id}`;
              }, {
                shallowEqual: false,
              })
            )
            .get(item.id);
      func({ item });
    });
  }, {
    // shallowEqual: false,
  });
  fn({ app: proxyState.app });

  const app = state.app;
  const nextList = app.list.slice();
  nextList[0] = { ...nextList[0] };
  proxyState.app = { ...app, list: nextList };

  fn({ app: proxyState.app });

  console.log('count ', runCount)

  return null
}