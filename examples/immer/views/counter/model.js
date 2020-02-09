import { produce } from 'immer'

export default () => ({
  state: {
    count: 0,
    items: [{
      number: 1,
    }]
  },
  reducers: {
    increment(state) {
      return {
        count: state.count + 1,
      }
    },
    decrement(state) {
      return {
        count: Math.max(0, state.count - 1),
      }
    },
    incrementItemNumber(state, index) {
      return produce(state, draft => {
        const number = draft.items[index].number
        draft.items[index].number = number + 1
      })
    },
    decrementItemNumber(state, index) {
      return produce(state, draft => {
        const number = draft.items[index].number
        draft.items[index].number = number - 1
      })
    }
  },
})