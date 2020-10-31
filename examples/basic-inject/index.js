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
import App from './views'

const store = createStore({
  models: new Models(),
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

export { store }
ReactDOM.render(<Basic />, document.getElementById('app'))

