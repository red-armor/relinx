import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import models from './models'

import App from './views'

const store = createStore({
  models
}, applyMiddleware(thunk({
  extraSupported: true,
})))

const Basic = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<Basic />, document.getElementById('app'))
