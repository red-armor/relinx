export default () => ({
  state: {
    count: 0,
  },
  reducers: {
    increment(state) {
      return {
        count: state.count + 1,
      }
    },
    decrement(state) {
      return {
        count: Math.max(0, state.count - 1),
      }
    },
  },
})