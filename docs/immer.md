# Inspired by immer

## What inspired by immer

1. the `patches`
2. the `paths`

```js
  const baseState = {
    countries: [{
      name: 'Japan',
      cities: [{
        province: 'nagoya',
        location: 'center',
      }],
    }, {
      name: 'China',
      cities: [{
        province: 'Liaoning',
        location: 'north'
      }, {
        province: 'wuhan',
        location: 'center',
      }]
    }]
  }

  produce(baseState, draftState => {
    draftState.countries[1].rank = 2
    draftState.countries[1].cities[0].location = 'northeast'
  }, (patches) => {
    console.log('patches : ', patches)
  })

// ------ result ----
// [{
//   "op": "replace",
//   "path": ["countries", 1, "cities", 0, "location"],
//   "value": "northeast"
// }, {
//   "op": "add",
//   "path": ["countries", 1, "rank"],
//   "value": 2
// }]
```

## Why not immer to resolve update patch path

```js
  const baseState = {
    country: [{
      name: 'Japan',
    }, {
      name: 'China',
    }]
  }

  produce(baseState, draftState => {
    // 虽然下面字面值是一样的，但是immer并不会去比较其中具体的内容
    draftState.country = [{
      country: [{
        name: 'Japan',
      }, {
        name: 'China',
      }]
    }]
  }, (patches) => {
    console.log('patches : ', patches)
  })

// -------- result ---------
[{
  "op":"replace",
  "path":["country"],
  "value":[{"country":[{"name":"Japan"},{"name":"China"}]}]
}]
```

## How to reduce comparison

1. first get what you care about..
2. `shallowCompare` but not constraint to `sharedCompare`