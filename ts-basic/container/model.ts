import { getGoods } from '../data-source/goods'
import { ContainerState } from '../types'

type fn = {
  updateState: (_: any, payload: { status: string }) => ({ status: string })
  updatePage: (state: {
    page: number,
    status: string,
  }) => { page: number },
  getGoodsList: {
    (): {(dispatch: Dispatch<actionType>, getState: Function): void }
  }
}


type getParams<T> = {
  [key in keyof fn]: key extends T ? fn[key] extends (S: any) => object ? never
  : fn[key] extends (S: any, payload: infer B) => object ? B extends any ? B : never : never : never

  // [key in keyof fn]: key extends T ? fn[key] extends (S: any, payload: infer B) => object ? B extends any ? B : never : never : never
}
type b = string extends unknown ? number : object

type Action<T> = {
  type: T,
  payload?: {
    [key in keyof getParams<T>]: getParams<T>[key]
  }[keyof getParams<T>]

  // payload?: getParams<T>
}

type m = {
  a: string;
  b: number;
}

type mm = m['a']

type ppp = (_: any, payload: { status: string }) => ({ status: string })
type pppp = ppp extends (S: any, payload: infer B) => object ? B : never


type Dispatch<T> = (action: Action<T> | Array<Action<T>>) => void

type actionType = 'updateState' | 'updatePage' | 'init/updateState'

type p = Parameters<(a: string) => void>[0]
type pp = Parameters<(a: string, b: number) => void>

export default (): {
  state: {
    page: number,
    status: string,
  },
  reducers: {
    updateState: (_: any, payload: { status: string }) => ({ status: string })
    updatePage: (state: {
      page: number,
      status: string,
    }) => { page: number }
  },
  effects: {
    getGoodsList: {
      (): {(dispatch: Dispatch<actionType>, getState: Function): void }
    }
  }

} => ({
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    updateState: (_, payload) => ({ status: payload.status }),
    updatePage: state => ({
      page: state.page + 1,
    }),
  },

  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { init: { page } } = getState()
      getGoods({ page }).then(result => {
        dispatch({
          type: 'init/updateState',
          payload: 'x'
        })

        dispatch([{
          type: 'updateState',
          payload: {
            status: 2
          }
        }])
        // dispatch([{
        //   type: 'goods/addGoods',
        //   payload: {
        //     goodsList: result,
        //   },
        // }, {
        //   type: 'updatePage',
        // }])
      })
    },
    // updateOnline: () => dispatch => {
    //   dispatch({
    //     type: 'updateState',
    //     payload: { status: 'online' },
    //   })
    // },
  },
})
