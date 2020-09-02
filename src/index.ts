import Provider from './Provider';
import applyMiddleware from './applyMiddleware';
import createStore from './createStore';
import useRelinx from './hooks/useRelinx';
import useDispatch from './hooks/useDispatch';
// import logger from './middleware/logger'
import thunk from './middleware/thunk';
import observe from './observe';
import { Model } from './types';

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

const models = {
  // init: {
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    // updateState: (_, { status }) => ({ status }),
    updatePage: (state: any) => ({
      page: state.page + 1,
    }),
  },

  // effects: {
  //   getGoodsList: () => (dispatch, getState) => {
  //     const { init: { page } } = getState()
  //     getGoods({ page }).then(result => {
  //       dispatch([{
  //         type: 'goods/addGoods',
  //         payload: {
  //           goodsList: result,
  //         },
  //       }, {
  //         type: 'updatePage',
  //       }])
  //     })
  //   },
  //   updateOnline: () => dispatch => {
  //     dispatch({
  //       type: 'updateState',
  //       payload: { status: 'online' },
  //     })
  //   },
  // },
  // }
};

function fn(model: Model) {
  console.log('model', model);
}

fn(models);

const store = createStore({
  models,
});
