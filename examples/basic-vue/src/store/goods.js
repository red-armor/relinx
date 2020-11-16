export default {
  namespaced: true,
  state: {
    listData: [],
    bottomBarUpdateCount: 0,// todo
    listLength: 0,
  },
  mutations: {
    addGoods(state, { goodsList }) {
      state.listData = [].concat(state.listData, goodsList)
      state.listLength = state.listData.length
    },
    incrementItemCount(state, { index }) {
      const { listData } = state
      const item = listData[index]
      const next = [...listData]
      next[index] = {
        ...item,
        count: item.count + 1
      }
      state.listData = next;
    },
    decrementItemCount(state, { index }) {
      const { listData } = state
      const item = listData[index]
      const next = [...listData]
      const nextCount = item.count - 1
      if (nextCount <= 0) {
        next.splice(index, 1)
      } else {
        next[index] = {
          ...item,
          count: nextCount,
        }
      }
      state.listData = next;
    },
    setProps: (state, payload) => (
      state = { ...state, ...payload }
    )
  },
  actions: {
    increment: ({ commit }, { id, index }) => {
      commit('incrementItemCount', { id, index })
      commit({
        type: 'bottomBar/incrementTotalCount',
      }, { root: true })
    },
    decrement: ({ commit }, { id, index }) => {
      commit('decrementItemCount', { id, index })
      commit({
        type: 'bottomBar/decrementTotalCount',
      }, { root: true })
    },
  },
}