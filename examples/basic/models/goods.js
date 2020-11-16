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
    incrementItemCount(state, { id }) {
      const { listData } = state
      const next = [...listData]
      const index = next.findIndex(item => item.id === id)
      const item = listData[index]

      if (index !== -1) {
        next[index] = {
          ...item,
          count: item.count + 1
        }
      }

      return {
        listData: next,
      }
    },
    decrementItemCount(state, { id }) {
      const { listData } = state
      const index = listData.findIndex(item => item.id === id)
      if (index === -1) return {}

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
      const state = getState()
      const { bottomBar, goods } = state

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