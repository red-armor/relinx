const user = new Proxy({
  location: 'beijing',
  name: new Proxy({
    familyName: 'ryu',
    firstName: 'li',
  }, {
    get(target, property, receiver) {
      return Reflect.get(target, property, receiver)
    }
  })
}, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver)
  }
})

// 如果说是解构的话，
const name = user.name
const { familyName, firstName } = name

user.name.familyName
user.name.firstName

// get :  name
// nest get :  familyName
// nest get :  firstName
// get :  name
// nest get :  familyName
// get :  name
// nest get :  firstName