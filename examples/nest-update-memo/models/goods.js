export default () => ({
  state: {
    listData: [],
    totalCount: 0,
  },
  reducers: {
    addGoods(state, { goodsList }) {
      const totalCount = state.totalCount
      const added = goodsList.reduce((sum, cur) => sum + cur.count, 0)
      return {
        listData: [].concat(state.listData, goodsList),
        totalCount: totalCount + added,
      }
    },
    incrementItemCount(state, { id, index }) {
      const { listData, totalCount } = state
      const item = listData[index]
      const next = [...listData]
      next[index] = {
        ...item,
        count: item.count + 1
      }
      return {
        listData: next,
        totalCount: totalCount + 1,
      }
    },
    decrementItemCount(state, { id, index }) {
      const { listData, totalCount } = state
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
        totalCount: totalCount - 1,
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
})