import React from 'react'
import ReactDOM from 'react-dom'
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from '../src'
import createModel from './models'
import { Models } from './types'

import App from './container'

const models = createModel()

type test = typeof models

const store = createStore<Models>({ models }, applyMiddleware(thunk, logger))

store.subscribe(({ oldState, newState, diff }) => {
  const { init } = oldState
  const data = init.page
})

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
