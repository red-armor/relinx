export default () => ({
  state: {
    count: 0,
  },
  reducers: {
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

  // effects: {
  //   paddingFn: () => (dispatch, getState) => {},
  // },
})