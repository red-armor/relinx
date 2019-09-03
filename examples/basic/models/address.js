export default {
  state: {
    location: 'shanghai',
  },
  reducers: {
    updateLocation: (state, payload) => {
      const { location } = payload

      return [{
        ...state, location: payload.location,
      }, {
        type: 'user/asyncLocation',
        payload: { location }
      }]
    }
  }
}