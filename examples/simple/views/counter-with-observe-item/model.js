export default () => ({
  state: {
    count: 0,
    items: [],
    items: [{
      number: 1,
    }, {
      number: 7,
    }, {
      number: 9,
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
      const { items } = state
      const item = items[index]
      const newItems = [...items]
      newItems[index] = {
        ...item,
        number: item.number + 1,
      }
      return { items: newItems }
    },
    decrementItemNumber(state, index) {
      const { items } = state
      const item = items[index]
      const newItems = [...items]
      newItems[index] = {
        ...item,
        number: item.number - 1,
      }
      return { items: newItems }
    }
  },
})