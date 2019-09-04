export default () => {
  const user = {
    age: 10,
    location: address.location
  }

  const address = {
    location: 'beijing',
  }

  const state = new Proxy({
    ...user,
    ...address,
  }, {
    get(target, property) {
      return Reflect.get(target, property)
    },
    set(target, property, value) {
      Reflect.set(target, property, value)
    }
  })
}