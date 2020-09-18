export interface GoodsViewModel {
  state: { listData: Array<object> },
  reducers: {
    addGoods: (state: any, payload: { goodsList: Array<object> }) => any
    incrementItemCount: (state: any, payload: { id: string }) => any
    decrementItemCount: (state: any, payload: { id: string, index: number }) => any
  },
  effects: {
    increment: (payload: { id: string, index: number }) => (dispatch: Function) => void
    decrement: (payload: { id: string, index: number }) => (dispatch: Function) => void
  }
}