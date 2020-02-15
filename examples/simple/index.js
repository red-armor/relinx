import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import Models from './models'

import App from './container/app'

const store = createStore({
  models: new Models(),
}, applyMiddleware(thunk, logger))

const Basic = () => (
  <Provider store={store} useProxy={false}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
