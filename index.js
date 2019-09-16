module.exports = {
  get Provider() {
    return require('./src/Provider').default
  },

  get applyMiddleware() {
    return require('./src/applyMiddleware').default
  },

  get createStore() {
    return require('./src/createStore').default
  },

  get useRelinx() {
    return require('./src/hooks/useRelinx').default
  },

  get logger() {
    return require('./src/middleware/logger').default
  },

  get thunk() {
    return require('./src/middleware/thunk').default
  }
}