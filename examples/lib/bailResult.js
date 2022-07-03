import { produce, Reaction, bailResult, StateTrackerUtil } from 'state-tracker'

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
    content: undefined,
  };
  const proxyState = produce(state);
  let count = 0;
  let value;

  new Reaction({
    fn: (state) => {
      const result = bailResult(state, [
        () => state.content.name,
        () => state.content.title,
      ]);

      value = result;
      count++;
    },
    state: proxyState,
  });

  console.log('count 1 ', count)
  console.log('value 1 ', value)

  let content = { name: 'name' };

  StateTrackerUtil.setValue(
    proxyState,
    {
      ...proxyState,
      content,
    },
  );
  console.log('count 2 ', count)
  console.log('value 2 ', value)

  // @ts-ignore
  content = { title: 'title' };
  StateTrackerUtil.setValue(
    proxyState,
    {
      ...proxyState,
      content,
    },
  );
  console.log('count 3 ', count)
  console.log('value 3 ', value)

  // // @ts-ignore
  // // not rerun if not used key's value changed
  content = { title: 'title', location: 'shanghai' };
  StateTrackerUtil.setValue(
    proxyState,
    {
      ...proxyState,
      content,
    }
  );
  console.log('count 4 ', count)
  console.log('value 4 ', value)
  // // expect(count).toBe(3);
  // // expect(value).toBe('title');
  return null
}