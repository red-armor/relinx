import React from 'react'
import ReactDOM from 'react-dom'
import {
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import Models from './models'

import App from './containers/app'

const store = createStore({
  models: new Models(),
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store} shouldLogRerender shouldLogActivity shouldLogChangedValue>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById('app'))
