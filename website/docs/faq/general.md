---
title: General
sidebar_position: 1
---

### How to dispatch actions

Do not attempt to call consecutive `dispatch`, the intermediate action will omitted. You could find the answer from [Dan's tweet](https://twitter.com/dan_abramov/status/1096898096011886592?lang=en)

![dan](./assets/dan.png)

In Relinx, you can dispatch an action array to fix.

```js
dispatch([action, action, action])
```

### The principal of data diff

1. For primitive type value, the literal value should be equal.
2. For Array or object, the comparison will break if their reference are equal. or comparison will continue until `pathNode` is exhausted.

### The Map and Set support

Recently, Relinx only support `Primitive Type`, `Array` and `object` types.

### Point to note when use on ES5

#### Do not use `undeclared` properties

For `ES5`, `Tracker` use `defineProperty` to re-define `getter` trap. However, it is not possible to define `getter` trap on `undeclared` properties, which means `Tracker` can not collect paths of these kinds of property access correctly. By the way, component re-render is derived by paths, which may cause non-update even though base value update.

```js
// appModel.js
export default () => ({
  state: {location: {}}
})

// view.js
const A = observe(() => {
  const [state] = useRelinx("app")
  return <span>{state.location.city}</span>
})
```

`appModel.js` should be the following format.

```js
// appModel.js
export default () => ({
  state: {
    location: {city: null}
  }
})
```

_About empty value, it should be defined as `null` instead of `undefined`. Because Relinx will check property value's value, if it is `undefined`, it will be regarded as `undeclared` property. which may make confuse when `strictMode` is set true_

##### How to find undeclared properties

Set true value to `Provider`'s `strictMode` prop. Then you can check warning in console log.

```js
<Provider strictMode>
  <App />
</Provider>
```

### When use `array.length` take care

1. For ES6, `array.length` could be trapped by `getter` trap automatically, so it has no problem when calls `map`, `filter` etc.
2. For ES5, the descriptor of Array's proto functions like `map`, `filter` etc could be override. `Tracker` will collect `length` path when calls these functions. However, there is an exception. `array.length`'s descriptor could not be override, which means `for` statement should be take care. You will lost `length` path if you write `arr.length` as condition statement.

### How to avoid memory leaks

For `memory leaks`, it always talk about how to remove unused subscriptions. In Relinx, subscription happens when add a `patcher` to `pathNode`. When `pathNode` find property value changes will do the following actions:

1. If it is primitive type value, compare its literal value. if not equal, `patchers` will be pushed to `pendingDispatchers`, and remove `patchers` from other `pathNodes`
2. If it is Array type value, and has new element added. add `patchers` to `pendingDispatchers`, and remove `patchers` from other `pathNodes`
3. If it is Array type value, and has element deleted. add `patchers` to `pendingDispatchers`, and these removed elements will not perform comparison action. After finish comparing `PathNodeTree`, destroy these `remove` PathNode.
4. If it is object type value, has key removed and this key has related `pathNode`. add `patchers` to `pendingDispatchers`, at the mean while, continue the comparison of remove keys. After finish comparing `PathNodeTree`, destroy these `remove` PathNode.
5. When component is un-mount, its related patcher will be destroyed.
6. When component is re-rendered, the paths of patcher will be updated, and re-bind `patcher` to `pathNode`

### How to optimize array re-render

For array's re-render, basically it caused by two factors: `length` change or `item[key]` change.

#### length changed

In general, the change of length value will cause `items`'s component to re-render. On the base of React update mechanism, parent component will trigger child components' re-render. For this situation, `React.memo` could help to isolate update if it is unnecessary to child component

#### item[key] changed

It is recommend that parent and child component should be wrapped with `observe` function. If `item[key]` changes, it will only trigger corresponding child component to re-render.

### How to perform selector on compared Object

Comparing with `Redux`, it use `shallowEqual` to verify value's update. `mapStateToProps` will be called on every time `state` changes which cause unnecessary keys' comparison or make performance issue. `React-Redux` official suggest to use [reselect](https://github.com/reduxjs/reselect) to avoid this kind of issue.

However, Relinx create `pathNode` for accessed property，and only property with `pathNode` will perform diff algorithm. So unnecessary keys' comparison could not happen by default.

### proxy support

By default, its value is `true`. It makes `backend` Tracker to use `Proxy` or `defineProperty`. However, `Tracker` will detect current context whether `Proxy` is supported first. If it's false, `useProxy` value will be ignored.