export default {
  state: {
    listData: [],
    itemCount: {},
  },
  reducers: {
    addGoods(state, { goodsList }) {
      return {
        listData: [].concat(state.listData, goodsList)
      }
    },
    incrementItemCount(state, { id }) {
      const { itemCount } = state
      const currentCount = itemCount[id] || 0
      return {
        itemCount: {
          ...itemCount,
          [id]: currentCount + 1,
        },
      }
    },
    decrementItemCount(state, { id }) {
      const { itemCount } = state
      const currentCount = itemCount[id] || 0
      return {
        itemCount: {
          ...itemCount,
          [id]: currentCount - 1,
        },
      }
    }
  },
  effects: {
    increment: ({ id }) => dispatch => {
       dispatch([{
        type: 'incrementItemCount',
        payload: { id }
      }, {
        type: 'bottomBar/incrementTotalCount',
      }])
    },
    decrement: ({ id }) => dispatch => {
      dispatch([{
        type: 'decrementItemCount',
        payload: { id }
      }, {
        type: 'bottomBar/decrementTotalCount',
      }])
    }
  }
}