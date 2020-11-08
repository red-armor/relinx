export default () => ({
  state: {count: 0},
  reducers: {
    setProps: (_, payload) => ({ ...payload })
  },
  subscriptions: {
    listenCount: ({ getState }) => {
      const { app: { count }} = getState()
      return {
        type: 'setProps',
        payload: { count }
      }
    }
  }
})
