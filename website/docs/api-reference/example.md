---
title: Example
sidebar_position: 4
---

- 初始化一个`model.js`文件
```js
// appModel.js
export default () => ({
  state: {count: 0},
  reducers: {
    increment: state => ({count: state.count + 1})
  }
})
```

- 将`model.js`进行聚合，生成一个`createModel`函数
```js
// models.js
import appModel from "./appModel"

export default () => ({
  app: new appModel()
})
```
- 创建`store`，同时将它引入到`Provider`
```js
// index.js
import React from "react"
import ReactDOM from "react-dom"
import {Provider, createStore, applyMiddleware, thunk} from "relinx"
import Models from "./models"

import App from "./views"

const store = createStore(
  {
    models: new Models()
  },
  applyMiddleware(thunk)
)

const Simple = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(<Simple />, document.getElementById("app"))
```
- `store`就可以通过`useRelinx`的方式直接在组件中访问

```js
// app.js
import React, {useCallback} from "react"
import {useRelinx, observe} from "relinx"

export default observe(() => {
  const [state, dispatch] = useRelinx("app")

  const {count} = state
  const handleClick = useCallback(() => dispatch({type: "increment"}), [])

  return (
    <div>
      <span>{count}</span>
      <button onclick={handleClick}>+</button>
    </div>
  )
})
```