---
title: Concepts
sidebar_position: 3
---

## Models

### state

Setup model's initial value

```js
export default () => ({
  state: {
    count: 0
  },
})
```

### reducers

```js
type Reducers<S> = {
  [key: string]: (state: S[modelKey], payload?: any) => Partial<S[modelKey]>
}
```
Process action in sync way, and result in changed value.

```js
export default () => ({
  // ...
  reducers: {
    increment: state => ({count: state.count + 1})
  }
})
```

### effects

```js
type effects<S> = (payload: any) => (
  dispatch: Function,
  getState: () => s
) => void
```
Backend with a `thunk` middleware function, Process action in async way. all the `ajax` should be placed here.

```js
export default () => ({
  // ...
  effects: {
    increment: ({ id }) => dispatch => {
      dispatch([{
        type: 'incrementItemCount',
        payload: { id },
      }, {
        type: 'bottomBar/incrementTotalCount',
      }])
    },
  }
})
```

### subscriptions
```js
type Fn = (options: { getState: Function, dispatch: Function }) => void

type Subscriptions = {[key: string]: Fn} | {
  [key: string]: {
    fn: Fn,
    shouldLogChangedValue: boolean
    shouldLogActivity: boolean
    ignoreSettingStateCompareLevel: boolean
  }
}
```

#### Params1
- __options__
  - `getState`: [`getState`](store.md/#getstate)
  - `dispatch`: [`dispatch`](store.md/#dispatch)

#### Params2
- `fn`: just like in [Params1](#params1)
- `shouldLogChangedValue`: __false__ as default value, It will log the changed value which trigger `subscription` rerun
- `shouldLogActivity`: __false__ as default value, It will log `props` or `state` changing on `subscription` initialization and rerun.
- `ignoreSettingStateCompareLevel`: __false__ as default value,

Subscription function `fn` will run once on initial to collect the properties path it should track. when its tracked property value changes, `fn` will rerun to fit the update.

## Views

### observe

```js
type Observe = <P extends {}>(
  WrappedComponent: FC<P>,
  options: {
    shallowEqual?: boolean;
    shouldLogActivity?: boolean;
    shouldLogRerender?: boolean;
    shouldLogChangedValue?: boolean;
  } = {}
) => FC<P>
```

> Wrapping a functional component and make it access path sensitive

1. 对Component进行一次React.memo的加持
2. 增加一个data access context，此时间段收集的属性路径都是归属当前的component以达到粒度化的控制

`observe` is to create a `Tracker` scope. Scope is made to achieve `fine-grained` re-render control.

In order to make `DEBUG` info easy to read, it'd better to wrap a `named` function component, like as follows.

```js
const A = () => <span>hello world</span>
const ObservedA = observe(A)
```

#### When to use observe

Theoretically, any React component is recommended to wrapped with observe function. It will create an individual update context for wrapped component.

However, it only meaningful when the component has `proxy state` passing from parent or use `useRelinx` method.

:::caution
- observe会对WrappedComponent进行一次React.memo的加持
- 增加一个data access context，此时间段收集的属性路径都是归属当前的component以达到粒度化的控制
:::

### useRelinx

```js
const [state: Proxy, dispatch: Function] = useRelinx(modelName: String)
```

#### Returns

##### state
`state` is an `proxy` object and decorated with getter trap; Accessed path will be collect when its property is used.

```js
const A = observe(() => {
  const [state] = useRelinx("app") // state value: { count: 1 }
  return <span>{state.count}</span>
})
```
#### dispatch
The only way to trigger an `Action` in View; Its usage is like in `Redux`;

:::note
- __useRelinx__ could only be used in functional component
- When use __useRelinx__, component or its ancestor component is required to be wrapped with __observe__ function
- It'd better to wrap component with __observe__ function when use __useRelinx__
:::

### useDispatch

```js
const [dispatch: Function] = useDispatch()
```
A straightforward hooks method to return `dispatch` if you do not need state.

### Action
```js
type Action = {
  type: string,
  payload?: any,
}
```

Action is a composite of `type` and `payload`. It is the only way to trigger state update, and should be called with `dispatch` function.

```js
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