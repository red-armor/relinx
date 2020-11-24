import React from 'react'
import ReactDOM from 'react-dom'
import {
  // logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import Models from './models'
import { goodsDataGenerator } from './data-source/goods'

import App from './containers/app'

const store = createStore({
  models: new Models(),
  initialValue: {
    goods: {
      listData: goodsDataGenerator({ page: 0 }),
    },
    init: {
      page: 1,
    }
  }
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
