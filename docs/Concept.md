# Concept

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

### createStore

关于`createStore`中的设置，其实就是关心到底改动了哪儿；也就是类似immer中的[Patches](https://immerjs.github.io/immer/docs/patches)；如果说此部分的逻辑替换成immer的话，也不是不可以；但是根据[Introducing Immer: Immutability the easy way](https://hackernoon.com/introducing-immer-immutability-the-easy-way-9d73d8f71cb3)中的描述，其实还是reducer这种方式是更高效的；然后需要在此部分自己完成`patch`的识别；最终将patch设置为value；然后根据这些`patch`去`register`中查找需要进行响应的模块；既然在`createStore`中以及完成了`patch`的逻辑；所以最好在此部分就将`getState`中store的就设置为最新的。