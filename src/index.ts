import Provider from './Provider';
import applyMiddleware from './applyMiddleware';
import createStore from './createStore';
import useRelinx from './hooks/useRelinx';
import useDispatch from './hooks/useDispatch';
// import logger from './middleware/logger'
import thunk from './middleware/thunk';
import observe from './observe';

export {
  Provider,
  applyMiddleware,
  createStore,
  useRelinx,
  useDispatch,
  // logger,
  thunk,
  observe,
};
