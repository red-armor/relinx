import { Models, KeyMap } from '../../types'
import { GetState, Dispatch} from '../../../src/types'

export default () => ({
  state: {
    listData: [],
  },
  reducers: {
    addGoods(state, { goodsList }) {
      return {
        listData: [].concat(state.listData, goodsList),
      }
    },
    incrementItemCount(state, { index }) {
      const { listData } = state
      const item = listData[index]
      const next = [...listData]
      next[index] = {
        ...item,
        count: item.count + 1
      }
      return {
        listData: next
      }
    },
    decrementItemCount(state, { index }) {
      const { listData } = state
      const item = listData[index]
      const next = [...listData]
      const nextCount = item.count - 1
      if (nextCount <= 0) {
        next.splice(index, 1)
      } else {
        next[index] = {
          ...item,
          count: nextCount,
        }
      }

      return {
        listData: next
      }
    },
  },
  effects: {
    increment: ({ id, index }) => dispatch => {
      dispatch([{
        type: 'incrementItemCount',
        payload: { id, index },
      }, {
        type: 'bottomBar/incrementTotalCount',
      }])
    },
    decrement: ({ id, index }) => (dispatch: Dispatch<Models, KeyMap>, getState: GetState<Models>) => {
      const state = getState()

      dispatch([{
        type: 'decrementItemCount',
        payload: { id, index },
      }, {
        type: 'bottomBar/decrementTotalCount',
      }])
    },
  },
})