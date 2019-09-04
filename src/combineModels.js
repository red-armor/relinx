export default models => {
  const keys = Object.keys(models)

  keys.forEach(key => {
    const model = models[key]

    // 如果想让state能够依赖其它的model的话，
    const {
      state,
      reducers,
      effects,
    } = model


  })
}