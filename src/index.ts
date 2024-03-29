import Provider from './Provider';
import applyMiddleware from './applyMiddleware';
import createStore from './createStore';
import useRelinx from './hooks/useRelinx';
import useDispatch from './hooks/useDispatch';
import useNamespace from './hooks/useNamespace';
import useGlobal from './hooks/useGlobal';
import thunk from './middleware/thunk';
import observe from './observe';
import inject from './inject';

export {
  Provider,
  applyMiddleware,
  createStore,
  useRelinx,
  useDispatch,
  useGlobal,
  useNamespace,
  thunk,
  observe,
  inject,
};

export * from './types';
