import { TotalState, Dispatch, KeyMap } from '../../index'
import { Models } from '../../types'

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
    decrement: ({ id, index }) => (dispatch: Dispatch<Models, KeyMap>, getState: () => TotalState) => {
      dispatch<'init/decrement'>({
        type: 'init/decrement',
        payload: {
          name: 'hello',
        }
      })
      dispatch([{
        type: 'decrementItemCount',
        payload: { id, index },
      }, {
        type: 'bottomBar/decrementTotalCount',
      }, {
        type: 'incrementItemCount',
      }])
    },
  },
})

// type Dispatch<T> = ({
//   type, payload
// }: {
//   type: 'decrementItemCount',
//   payload?: any
// }) => void

// const dispatch: Dispatch<number> = (action) => {
//   console.log('action')
// }

// interface PageInfo {
//   title: string;
// }

// type Page = "home" | "about" | "contact";

// const nav: Record<Page, PageInfo> = {
//   about: { title: "about" },
//   contact: { title: "contact" },
//   home: { title: "home" },
// };

