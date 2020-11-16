import { getGoods } from '../data-source/goods'

export default {
  namespaced: true,
  state: {
    page: 0,
    status: 'offline',
  },
  mutations: {
    updateState: (state, payload) => {
      state.status = payload.status;
    },
    updatePage: state => {
      state.page = state.page + 1;
    },
  },
  actions: {
    getGoodsList: ({ state, commit }) => {
      getGoods({ page: state.page }).then(result => {
        commit({
          type: 'goods/addGoods',
          goodsList: result,
        }, { root: true })
        commit({
          type: 'updatePage'
        })
      })
    },
    updateOnline: ({ commit }) => {
      commit('updateState', {
        status: 'online'
      })
    },
  },
}