import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
} from 'relinx'
import models from './models'
import App from './views'

const store = createStore({
  models
}, applyMiddleware(logger))

const Basic = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<Basic />, document.getElementById('app'))
