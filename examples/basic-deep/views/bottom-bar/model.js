export default () => ({
  state: {
    count: 0,
    currentItem: null,
  },
  reducers: {
    setProps: (_, payload) => ({ ...payload }),
    incrementTotalCount(state) {
      return {
        count: state.count + 1,
      }
    },
    decrementTotalCount(state) {
      return {
        count: Math.max(0, state.count - 1),
      }
    },
  },
  subscriptions: {
    setup({ getState }) {
      const state = getState()
      const { goods } = state
      const { currentId } = goods
      const currentItem = goods.listData.find(item => item.id === currentId)

      return [{
        type: 'setProps',
        payload: { currentItem }
      }]
    }
  }
})