import { getGoods } from '../../data-source/goods'

export default () => ({
  state: {
    page: 0,
    listData: [],
    bottomBarUpdateCount: 0,
    listLength: 0,
    currentId: '',
    currentItem: null,
  },
  reducers: {
    addGoods(state, { goodsList }) {
      return {
        listData: [].concat(state.listData, goodsList),
      }
    },
    swap(state) {
      const { listData } = state
      const temp = listData[1]
      const temp2 = listData[3]

      const nextData = [...listData]
      nextData[1] = temp2
      nextData[3] = temp

      return {
        listData: nextData
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
        currentId: id,
        currentItem: next[index],
        currentIndex: index,
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
        currentId: id,
        currentItem: next[index],
        currentIndex: index,
      }
    },
    setProps: (_, payload) => ({ ...payload }),
    pumpData: state => {
      const { listData } = state
      return {
        listData: listData.map(item => ({ ...item, c: Date.now() }))
      }
    }
  },
  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { goods: { page } } = getState()
      getGoods({ page }).then(result => {
        dispatch({
          type: 'setProps',
          payload: {
            listData: result,
            page: page + 1,
          }
        })
      })
    },

    addMore: () => (dispatch, getState) => {
      const { goods: { listData, page } } = getState()
      getGoods({ page }).then(result => {
        dispatch({
          type: 'setProps',
          payload: {
            listData: listData.concat(result),
            page: page + 1,
          }
        })
      })
    },

    increment: ({ id }) => dispatch => {
      dispatch([{
        type: 'incrementItemCount',
        payload: { id },
      }, {
        type: 'bottomBar/incrementTotalCount',
      }])
    },
    decrement: ({ id }) => dispatch => {
      dispatch([{
        type: 'decrementItemCount',
        payload: { id },
      }, {
        type: 'bottomBar/decrementTotalCount',
      }])
    },
  },
  subscriptions: {
    setup({ getState }) {
      const state = getState()
      const { bottomBar } = state

      return {
        type: 'setProps',
        payload: {
          bottomBarUpdateCount: bottomBar.count,
        }
      }
    }
  }
})