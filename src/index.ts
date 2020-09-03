import Provider from './Provider';
import applyMiddleware from './applyMiddleware';
import createStore from './createStore';
import useRelinx from './hooks/useRelinx';
import useDispatch from './hooks/useDispatch';
import thunk from './middleware/thunk';
import observe from './observe';
import { Model, ReducerMapObject } from './types';

export {
  Provider,
  applyMiddleware,
  createStore,
  useRelinx,
  useDispatch,
  thunk,
  observe,
};

interface State {
  page: number;
  status: string;
}

const model2 = {
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    updatePage: (state: State, payload: object) => {
      console.log('state ', state, payload);
      return state;
    },
  },
};

function fn2<S, R, SK extends keyof S, RK extends keyof R>(
  model: Model<S, SK, R, RK>
): Model<S, SK, R, RK> {
  return model;
}

fn2(model2);
