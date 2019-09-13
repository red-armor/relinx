let count = 0
let subCount = 0
const IS_HEADING = Symbol('is heading')

const set =  function set (target, property, value, receiver) {
    Reflect.set(target, property, value, receiver)
    return true
  }
 const get = function get(target, property, receiver) {
    if (!target[property]) {
      Reflect.set(target, property, new Proxy({}, {
          get, set
      }), receiver)
    }

    if (target[IS_HEADING]) {
        count += 1
        subCount = 0
    }

    console.log('subscribe : ', `${count}-${Date.now()}-${property}`)

    return Reflect.get(target, property, receiver)
  }
const state = new Proxy({}, {
  get,
  set,
})
state[IS_HEADING] = true

state.a.b
state.a
state.a.b.c.d