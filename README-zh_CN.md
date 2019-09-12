# Relinx

## 运行

```bash
$ yarn
$ yarn examples:basic
```

go to `http://localhost:8080/`

## 基本概念

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, createStore } from 'relinx'
import models from './models'
import App from './views'

const store = createStore({
  models
})

const Basic = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<Basic />, document.getElementById('app'))
```

核心上每一个`model`主要三部分组成：`state`, `reducers`和`effects`

### state

### reducers

### effects

## 特点

1. 提供轻量型响应式的UI更新
2. 写法上尽量减少文件跨度，避免了`redux`造成了繁琐性
3. diff策略上，实现了尽可能少的组件更新

## TODO

1. 对传递的`proxy` data设置作用域；它的变化应该对应的是消费该字段的子组件

## reducer

只需返回需要更改的对象

## dispatch

### 如何引入

## QA

### dispatch action array

https://twitter.com/dan_abramov/status/1096898096011886592?lang=en

连续的dispatch会被进行`batch`处理，也就会消掉`intermediate value`；所以，dispatch可以接受一个数组的形式
