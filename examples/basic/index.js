import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, createStore } from 'relinx'
import models from './models'
import App from './views'

const store = createStore({
  models
})

const Basic = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<Basic />, document.getElementById('app'))
