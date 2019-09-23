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

import Test from '../../src/reactive-state/test'
// import App from './views'

const store = createStore({
  models
}, applyMiddleware(logger, thunk({
  extraSupported: true,
})))

const Basic = () => {
  // return (
  //   <Provider store={store}>
  //     <App />
  //   </Provider>
  // )

  return <Test />
}

ReactDOM.render(<Basic />, document.getElementById('app'))
