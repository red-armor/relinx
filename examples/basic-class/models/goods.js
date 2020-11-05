export default () => ({
  state: {
    listData: [],
    bottomBarUpdateCount: 0,
    listLength: 0,
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
    setProps: (_, payload) => ({ ...payload })
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
    setup({ getState }) {
      const { bottomBar, goods } = getState()

      return [{
        type: 'setProps',
        payload: {
          bottomBarUpdateCount: bottomBar.count,
        }
      }, {
        type: 'setProps',
        payload: {
          listLength: goods.listData.length,
        }
      }]
    }
  }
})