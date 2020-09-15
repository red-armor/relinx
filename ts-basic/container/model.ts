import { getGoods } from '../data-source/goods'
import { ContainerState } from '../types'

export default () => ({
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    updateState: (_, payload) => ({ status: payload.status }),
    updatePage: state => ({
      page: state.page + 1,
    }),
  },

  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { init: { page } } = getState()
      getGoods({ page }).then(result => {
        dispatch([{
          type: 'goods/addGoods',
          payload: {
            goodsList: result,
          },
        }, {
          type: 'updatePage',
        }])
      })
    },
    updateOnline: () => dispatch => {
      dispatch({
        type: 'updateState',
        payload: { status: 'online' },
      })
    },
  },
})
