export default {
  namespaced: true,
  state: {
    count: 0,
  },
  mutations: {
    incrementTotalCount(state) {
      state.count += 1;
    },
    decrementTotalCount(state) {
      state.count = Math.max(0, state.count - 1)
    },
  },
}