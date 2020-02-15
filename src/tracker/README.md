# Tracker

```js
/**
 * @params {function} auto run when `state[key]` value change
 * @return {Computation}
 */
const state = useTracker(fn)

console.log('state ', state.a)

state.a = '3' // will trigger fn to run
```

```js
function useTrack(fn) {
  const state = new Computation(fn)

  state.onEffect(() => {

  })

  return new Proxy({}, handler)
}
```