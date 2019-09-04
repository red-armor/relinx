import React, { useReducer } from 'react';
import ReactDOM from 'react-dom';

import models from './modules'

const store = createStore(models)

import {
  useRelinx,
} from 'relinx';

const App = () => {
  return (
    <div>
      hell world
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
