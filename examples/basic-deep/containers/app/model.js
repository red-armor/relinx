export default () => ({
  state: {
    status: 'offline',
  },

  reducers: {
    setProps: (_, payload) => ({ ...payload }),
    updateState: (_, { status }) => ({ status }),
  },

  effects: {
    updateOnline: () => dispatch => {
      dispatch({
        type: 'updateState',
        payload: { status: 'online' },
      })
    },
  },
})
