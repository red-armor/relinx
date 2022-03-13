---
title: Inspired by immer
sidebar_position: 3
---

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


## createStore

关于`createStore`中的设置，其实就是关心到底改动了哪儿；也就是类似immer中的[Patches](https://immerjs.github.io/immer/docs/patches)；如果说此部分的逻辑替换成immer的话，也不是不可以；但是根据[Introducing Immer: Immutability the easy way](https://hackernoon.com/introducing-immer-immutability-the-easy-way-9d73d8f71cb3)中的描述，其实还是reducer这种方式是更高效的；然后需要在此部分自己完成`patch`的识别；最终将patch设置为value；然后根据这些`patch`去`register`中查找需要进行响应的模块；既然在`createStore`中以及完成了`patch`的逻辑；所以最好在此部分就将`getState`中store的就设置为最新的。

## array

### getOwnPropertyName

它其实会包含`length`

```js
> const arr = []
undefined

> Object.getOwnPropertyNames(arr)
[ 'length' ]

> arr.push(1)
1
> Object.getOwnPropertyNames(arr)
[ '0', 'length' ]

> Object.getOwnPropertyDescriptors(arr)
{ '0':
   { value: 1, writable: true, enumerable: true, configurable: true },
  length:
   { value: 1,
     writable: true,
     enumerable: false,
     configurable: false } }

> Object.getOwnPropertyDescriptor(arr, 0)
{ value: 1, writable: true, enumerable: true, configurable: true }

> Object.getOwnPropertyDescriptor(arr, 'length')
{ value: 1,
  writable: true,
  enumerable: false,
  configurable: false }
```