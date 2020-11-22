
import {
  logger,
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import createModel from '../../examples/simple/models'
import App from '../../examples/simple/container/app'

const store = createStore({
  models: createModel()
}, applyMiddleware(thunk, logger))

const Basic = () => (
  <Provider store={store} useProxy={false}>
    <App />
  </Provider>
)

export default Basic