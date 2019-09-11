# Relinx

another react state management using Hooks

## reducer

只需返回需要更改的对象

## dispatch

// https://twitter.com/dan_abramov/status/1096898096011886592?lang=en
连续的dispatch会被进行`batch`处理，也就会消掉`intermediate value`；所以，dispatch可以接受一个数组的形式

### 如何引入

## action
```js
{
  type: 'a/b',
  payload: {},
}
```

- `effect`通过异步的方式返回一个action
- `reducer`通过同步的方式返回一个action

## state

- 在`reducers`和`effects`传入的`state`不能够是`reactive`; 貌似现在没有这个问题
- `reducers`中的`state`应该是当前`model`的`state`
- 如果说需要使用到其他model的值的话，这个时候需要通过effects来实现

## expr

实现`mobx - expr`类似的功能；比如`itemCount`只是改了当前的item的值，其它的组件不应该有变化。
但是貌似这个被业务方控制不太好。。。。待定。。。。。

## reducer return result的粒度化程度。。。

