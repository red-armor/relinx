import React from "react"
import ReactDOM from "react-dom"
import {Provider, createStore, applyMiddleware} from "relinx"
import {thunk, logger} from "@relinx/middleware"
import createModel from "./models"
import App from "./views"

const store = createStore(
  {
    models: createModel()
  },
  applyMiddleware(thunk, logger)
)

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Basic />, document.getElementById("app"))
