---
title: Store
sidebar_position: 2
description: 'store: the core methods'
---

`Relinx`对于`store`的设定是一个比较传统的模式；通过顶层注入的方式，在子组件中通过modelKey的方式来获得对应的数据源；

在store中它都是以model为维度进行控制；比如提供的`useRelinx`方法最终返回的是指定`modelKey`对应下的内容；同时原则上在一个组件中不能够存在多个`useRelinx`也就不能够存在多个`model`;这个其实是为了实现组件的一个自闭环的原则；

## Store Methods

### getState

```js
type GetState = () => State
```

返回当前的应用的state；它包含了所有的model

### dispatch
```js
type Dispatch = (action) => void
```

接受一个`Action`，然后触发model中数据的更新

### injectModel
```js
type InjectModel = (options: {
  key: string
  model: {
    state?: {},
    reducers?: {},
    effects?: {},
    subscriptions?: {}
  },
  targetKey?: string
}) => void
```

#### Params
- __key__: 需要注入的model对应的key
- __model__: 主要注入的model对象
- __targetKey__: 支持临时先使用`key`的值作为`model`对应的`key`，但是当满足一定的条件时，会将`model`的`key`替换为`targetKey`的值

这个方法主要针对`dynamic`引入`model`的场景；一般情况下，`models`都会在进行`store`初始化的时候进行创建；比如下面的方式

```js
const createModels = () => ({
  app: createAppModel(),
  goods: createGoodsModel(),
})

const store = createStore(
  models: createModels(),
)
```

但是对于初始化时`models`为空的场景，可以通过`injectModel`的方式实现动态的`model`插入；上面的写法就成为了下面的方式

```js
const store = createStore(
  models: {}
)
store.injectModel({
  key: 'app',
  model: createAppModel(),
})
store.injectModel({
  key: 'goods',
  model: createGoodsModel(),
})
```

## API
### createStore
```js
export type CreateStoreFn<
  T extends BasicModelType<T>,
  K extends keyof T = keyof T
> = (configs: {
  models: CreateStoreOnlyModels<T>;
  initialValue?: {
    [key in K]?: any;
  };
}, enhancer?: EnhanceFunction) => Store<T>;
```
#### Params
- __configs__
  - __models__: 初始化的models，可以是一个空对象，然后通过动态的方式增加model
  - __initialValue__: 在model注入到store时，会将initialValue按照key的维度进行初始化更新
- __enhancer__: middleware，类似redux中的middleware，目前主要提供了thunk解决异步的问题

#### Example

```js
import {
  Provider,
  createStore,
  applyMiddleware,
  thunk,
} from 'relinx'
import Models from './models'

import App from './container/app'

const store = createStore({
  models: new Models(),
}, applyMiddleware(thunk))

const Basic = () => (
  <Provider store={store}>
    <App />
  </Provider>
)
```

### applyMiddleware

```js
export interface ApplyMiddleware {
  (...args: Array<Middleware>): EnhanceFunction;
}
```
`middleware`主要是为了解决如何对relinx中的数据流进行劫持，然后提供进行一系列数据处理的能力；它的实现和[redux - middleware](https://redux.js.org/api/applymiddleware)基本上一致；都会将[`dispatch`](#dispatch)和[`getState`](#getstate)两个函数作为参数，然后返回一个函数，而这个返回的函数都会有一个`next`方法来驱动下一个`middleware`的调用；可以通过`next(action)`的方式，将`action`传入下一个`middleware`进行处理；它最终的形式是这样的`({ getState, dispatch }) => next => action`
