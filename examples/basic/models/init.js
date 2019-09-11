import { getGoods } from '../data-source/goods'

export default {
  state: {
    page: 0,
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
    }
  }
}
