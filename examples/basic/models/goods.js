export default () => ({
  state: {
    listData: [],
  },
  reducers: {
    addGoods(state, { goodsList }) {
      return {
        listData: [].concat(state.listData, goodsList),
      }
    },
    incrementItemCount(state, { id, index }) {
      const { listData } = state
      const item = listData[index]
      const next = [...listData]
      next[index] = {
        ...item,
        count: item.count + 1
      }
      return {
        listData: next,
      }
    },
    decrementItemCount(state, { id, index }) {
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

      return {
        listData: next,
      }
    },
  },
  effects: {
    increment: ({ id, index }) => dispatch => {
      dispatch([{
        type: 'incrementItemCount',
        payload: { id, index },
      }, {
        type: 'bottomBar/incrementTotalCount',
      }])
    },
    decrement: ({ id, index }) => dispatch => {
      dispatch([{
        type: 'decrementItemCount',
        payload: { id, index },
      }, {
        type: 'bottomBar/decrementTotalCount',
      }])
    },
  },
  subscriptions: {
    setup({ state }) {
      const { bottomBar } = state
      console.log('bottom bar ', bottomBar.count)
    }
  }
})