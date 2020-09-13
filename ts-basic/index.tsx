import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
  // @ts-ignore
} from '../src'
import createModel from './models'

import App from './container'

const models = createModel()

const store = createStore<typeof models>({ models }, applyMiddleware(thunk, logger))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
