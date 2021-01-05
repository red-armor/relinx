import React from 'react'
import ReactDOM from 'react-dom'
import {
  // logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import { goodsDataGenerator } from './data-source/goods'
import createInit from './containers/app/model'
import createGoods from './views/goods/model'
import createBottomBar from './views/bottom-bar/model'

import App from './containers/app'

const store = createStore({
  models: {
    bottomBar: createBottomBar(),
  },
  initialValue: {
    goods: {
      listData: goodsDataGenerator({ page: 0 }),
    },
  }
}, applyMiddleware(thunk))

store.injectModel({
  key: 'goods',
  model: createGoods(),
})
store.injectModel({
  key: 'init',
  model: createInit(),
  initialValue: {
    page: 1,
  }
})

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
