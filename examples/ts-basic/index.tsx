import React from 'react'
import ReactDOM from 'react-dom'
import {
  // logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
  // @ts-ignore
} from 'relinx'
import createModel from './models'

import App from './container'

const store = createStore({
  models: createModel()
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
