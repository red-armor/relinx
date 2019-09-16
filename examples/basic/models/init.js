import { getGoods } from '../data-source/goods'

export default {
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    updateState: (_, { status}) => {
      return { status, }
    }
  },

  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { init: { page } } = getState()
      getGoods({ page }).then(result => {
        dispatch({
          type: 'goods/addGoods',
          payload: {
            goodsList: result,
          },
        })
      })
    },
    updateOnline: () => dispatch => {
      dispatch({
        type: 'updateState',
        payload: { status: 'online' },
      })
    }
  }
}
