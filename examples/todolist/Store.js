import {
  logger, createStore, applyMiddleware, thunk,
} from 'relinx'
import Models from './models'

const store = createStore(
  {
    models: Models(),
  },
  applyMiddleware(thunk, logger)
)

export default store

