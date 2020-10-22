import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'relinx'
import TodoApp from './TodoApp';
import store from './Store.js';

ReactDOM.render(
  <Provider store={store}>
    <TodoApp />
  </Provider>,
  document.getElementById('app')
);
