import { ModelEffect, ModelReducer } from './';

export interface StoreState {
  [storeKey: string]: {
    [key: string]: any;
  };
}

export interface GetStoreState {
  (): StoreState;
}

export interface ApplyMiddlewareAPI {
  getState(): StoreState;
  reducers: {
    [storeKey in keyof StoreState]: {
      [key: string]: ModelReducer<StoreState[storeKey]>;
    };
  };
  effects: {
    [storeKey in keyof StoreState]: {
      [key: string]: ModelEffect;
    };
  };
  dispatch(...args: Array<any>): {};
}

// const store = {
//   first: {
//     name: 'liu',
//   },
//   second: {
//     location: 'shanghai',
//   },
// };

// function fn(api: ApplyMiddlewareAPI) {}

// const test: ApplyMiddlewareAPI = {
//   getState: () => store,
//   reducers: {
//     first: {
//       increment: state => {
//         console.log('state ', state.second);
//         return {};
//       },
//     },
//   },
// };
