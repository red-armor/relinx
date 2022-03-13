---
title: Provider
sidebar_position: 1
---

```js
type Provider = ({
  store: S,
  namespace?: string
  shouldLogRerender?: boolean
  shouldLogActivity?: boolean
  shouldLogChangedValue?: boolean
}) => FC
```

### Params
- `store`: [`createStore`](store.md/#createstore)创建的全局`state`对象
- `namespace`: 它是为了解决不同的`Application`之间进行通信时，指定一个外部可以触及到的`key`；会配合着`useNamespace`进行使用；如果没有指定的话，会被自动分配一个`random key`
- `shouldLogRerender`: 默认`false`, 用来提示哪个组件发生了`rerender`
- `shouldLogActivity`: 默认`false`, 用来打印出当组件初始化，更新时在`state`和`props`两个维度到底发生了什么变化
- `shouldLogChangedValue`: 默认`false`，用来提示当组件发生`rerender`时，具体是因为哪些属性的变化所引起的。

:::caution
`shouldLogRerender`, `shouldLogActivity`和`shouldLogChangedValue`这三个属性如果在`Provider`层被设置的话是一个`global`配置，它会影响到所有的`Component`和`model`；

所以，有的时候为了减少不必要的日志展示，`relinx`同样支持在`Component`和`model`维度的设置；这种形式也是比较推荐的
:::

### Example

```js
const store = createStore({
  models: new Models(),
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)
```