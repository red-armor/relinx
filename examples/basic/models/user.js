// 1. 比如希望用address中的初始值，来定义这边的初始值

export default {
  state: getState => {
    const { address } = getState()
    return {
      age: 0,
      location: address.location,
    }
  },
  reducers: {
    increment(state) {
      return { ...state, count: state.count + 1}
    },
    syncLocation(state, payload) {
      return { ...state, location: payload.location }
    }
  },
  effects: {
    fetchLocation() {
      return {
        type: 'updateLocation',
        payload: 'shanghai',
      }
    },
    fetchAsyncLocation() {
      return (dispatch, getState) => {
        const { timeZone: { current }} = getState()

        getLocationByTimeZone(current).then(location => {
          dispatch({
            type: 'updateLocation',
            payload: { location },
          })
        })
      }
    }
  }
}