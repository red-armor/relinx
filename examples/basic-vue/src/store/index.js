import Vue from 'vue'
import Vuex from 'vuex'
import init from './init'
import goods from './goods'
import bottomBar from './bottomBar'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    init,
    goods,
    bottomBar
  },
})
