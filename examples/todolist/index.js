import React from 'react';
import ReactDOM from 'react-dom';
import {
  Provider, logger, createStore, applyMiddleware, thunk,
} from 'relinx'

import App from './containers/app';
import Models from './models'

const store = createStore(
  {
    models: Models(),
  },
  applyMiddleware(thunk, logger)
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
