# Relinx

## 运行

```bash
$ yarn
$ yarn examples:basic
```

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

状态对应着`UI`，state的改变会触发`UI`的更新；通过`state.bottomBar.count`可以实现当前组件与`bottomBar` model下`count`属性值改变的绑定。

```js
import React from 'react'
import { useRelinx } from 'relinx'

export default () => {
  const [state] = useRelinx

  return (
    <div>
      {state.bottomBar.count}
    </div>
  )
}
```

### action

类同于比如`redux`, `rematch`以及`dva`等状态管理器；`action`是唯一触发`state`更改的方式；只有通过`dispatch(action)`的方式才能够进行状态的变化；

```js
{
  type: 'increment',
  payload: {},
}
```

`action`主要是由两部分组成，`type`和`payload`；

#### 如何产生action

- 用户在组件层面，在比如事件等场景下进行dispatch操作
- 在`effects`中进行`dispatch`操作

### reducers

接受`action`并且返回通过`action`处理以后的结果；可以认为是数据进行更改的起点

### dispatch



### effects

通过异步的方式来返回一个`action`

## 开发规范

- `reducers`中的`state`应该是当前`model`的`state`
- 如果说需要使用到其他model的值的话，这个时候需要通过effects来实现

## Redux vs Relinx

### 相同点

- 对于`action`的处理方式上都是一致的；`dispatch`是所有`action`的原动力；

### 不同点

- 数据绑定的方式，`redux`主要是通过`mapStateToProps`，`mapDispatchToProps`以及`connect`实现组件层面和数据源的绑定；当`Provider`层数据源发生变化时，调用变化数据部分`connect`组件。`Relinx`是基于`Proxy`提供的`trap`来实现，对于组件中使用到的[`get(proxy[foo]和proxy.bar)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get)进行`reactive path`的订阅，当`reactive path`被命中时就触发当前组件的更新
- `dispatch`处理的数据类型；`redux`可以支持`action`以及`function`的`dispatch`操作；`Relinx`只支持`action`的处理，`dispatch function`可以通过提供对应的`action`和`payload`实现调用
- `dispatch`用法上的区别；在`redux`中可以连续的进行`dispatch`操作；而对于`relinx`如果说想要连续操作两个或者以上的`action`的话，需要通过数组的形式来提供`dispatch([...actions])`否则中间的改变值会被抹掉
- `reducer`返回值的区别；在`redux`中每一个`reducer`返回的应该是一个全量的`state`，所以它的返回形式是`{...state, [updatedKey]: updatedValue }`；而对于`Relinx`它返回的是当前`model`中变化的部分也就是`{[updatedKey]: updatedValue}`

## 特点

1. 提供轻量型响应式的UI更新
2. 写法上尽量减少文件跨度，避免了`redux`造成了繁琐性
3. diff策略上，实现了尽可能少的组件更新

## 解决的问题

- 通过`new Context API`解决props的跨层级问题
- 解决`Provider`数据源会触发所有`Consumer`进行`update`的问题
- 组件层面`reactive field`的数据绑定，组件只会对使用到的`field`进行`re-render`；可以粒度化到`object.property`程度
- 提供处理同步以及异步数据源的能力
- 提供app开发层面的实践模式

## QA

### dispatch([...actions])

对于多个`actions`为什么先进行聚合再进行`dispatch`操作；详见Dan的描述

https://twitter.com/dan_abramov/status/1096898096011886592?lang=en

```js
dispatch(increment)
dispatch(increment)
dispatch(increment)
```

比如对于上面的形式，你尽管在`reducer`中可以看到值进行`0 -> 1 ->2`的变化，但是在`useEffect`层面你最终只能够拿到`2`对于其中的中间值会被做掉；对于`redux`的而言，因为它的`reducer`每一次返回都是一个全量的`state`,并且每一次的dispatch实际上是生效了，对它而言`useEffect`合并`result`其实是一个优化的效果；但是对于`Relinx`，因为它的`reducer`返回的是一个`partial state(当前model发生改变的部分)`，同时`reducer`的值并不会直接映射到`state`，如果说中间状态被做掉的话，就会出现中间部分数据对应的组件没有响应。所以对于上面的形式`Relinx`对应的写法

```js
dispatch([{
  type: 'increment',
}, {
  type: 'increment',
}, {
  type: 'increment'
}])
```

### 如何实现`object.property`粒度化的响应式

比如说一个场景，渲染`list`为了尽量不更改`list.item`中的数据；如果说存储`item`是否被选中；在`Redux`中的实现方式一般如下；它存在的问题是每一次`isItemsSelected`发生变化的话，所有的`item`其实都会被`re-render`；（对于这个问题其实有其它的方式来解决了）

```js
const Item = props => {
	const { isItemsSelected, itemIndex } = props

  return (
    <div>
    	{isItemsSelected[itemIndex] ? <Selected /> : <Unselected />}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    isItemsSelected: state.isItemsSelected
  }
}
```

`mobx`中的实现方式是通过[`expr`](https://mobx.js.org/refguide/expr.html)

```js
const TodoView = observer(({todo, editorState}) => {
    const isSelected = mobxUtils.expr(() => editorState.selection === todo);
    return <div className={isSelected ? "todo todo-selected" : "todo"}>{todo.title}</div>;
});
```

### 如何实现对Array的响应式

## TODO

1. 对传递的`proxy` data设置作用域；它的变化应该对应的是消费该字段的子组件
2. 提供middleware机制，比如logger观察目前更改的数据，以及对应的组件

