import { getGoods } from '../data-source/goods'

export default {
  state: {
    page: 0,
  },
  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { init: { page } } = getState()
      console.log('page : ', page)

      getGoods({ page }).then(result => {
        console.log('result : ', result)
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
