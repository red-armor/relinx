// TODO unit-test

// const mock = [{
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 32,
//   name: 'ContentHeader',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 357,
//   name: 'Section',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.358',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 275,
//   name: 'Section',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.276',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 276,
//   name: 'SectionHeader',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.276.277',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 291,
//   name: 'Section',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.292',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 342,
//   name: 'Group',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.292.343',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 292,
//   name: 'SectionHeader',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.292.293',
// }, {
//   autoRunFunction: () => {},
//   onEffectCallback: [],
//   id: 358,
//   name: 'SectionHeader',
//   dirty: false,
//   autoRunUpdated: false,
//   pathNumber: '28.29.33.44.358.359',
// }]

// 如果进行`mergeAutoRunActions`操作的话；它的原则是如果说`parent`和`children`
// 都是待更新的话，`children`会被抹掉，因为它的更新可以通过`parent`的更新来触发，这
// 样操作的好处是能够尽量减少`update`；但是同样这样也会存在一定的风险，比如说`chilren`
// 通过`React.memo`来进行优化的时候，如果命中了它的`true`逻辑，这个时候子组件是没有更新
// 了；

// 最好的粒度化渲染控制，应该是用`observe`作为标志；凡是`observe`包括的函数都在状态
// 管理层进行一次`React.memo`的封装；但是这么做的话，存在的问题是，比如初始化的时候
// store为`{}`；这个时候子组件并没有运行，也就没有所谓的`register path`这个逻辑；
// 所以store这个时候接收到了`updated value` 的时候，顶层的`Component`应该可以
// 正常的update；但是它内部的子组件，凡是observe包裹的都不能够再执行；所以下面的形式
// 存在问题的
// ----------- observe.js ------
// export default WrappedComponent => {
//   const MemoComponent = React.memo(props => {
//     return <WrappedComponent {...props} />
//   }, () => true)
//   return props => {
//     return (
//       <context.Provider
//       value={{
//         ...rest,
//         pathNumber: newPathNumber,
//         computation: newComputation,
//       }}
//     >
//       <React.Fragment>
//         {/* <MemoWrapped /> */}
//         <MemoComponent {...props} />
//         <ResetComputationHelper />
//       </React.Fragment>
//     </context.Provider>
//     )
//   }
// }
// 修正的方式，就是对memo进行function的完善，需要比较`prev`和`next`来进行判断子组件
// 是否进行`update`;但是如果说这种方式的话，其实有一个顾虑：`observe`直接对
// `WrappedComponent`进行一次`memo`封装？？？？？？？
// 目前采用的策略是先不进行`memo`封装，遵循React的更新原则，父类的更改可以触发`children`
// 的更改；那么这个时候就存在另一个问题；什么时候使用`React.memo`；

// ```js
// const A = () => {
//   const [state] = useRelinx('app')
//   const { number } = state
//   return <>{number}</>
// }

// const B = () => {
//   const [dispatch] = useDispatch()
//   useEffect(() => {
//     如果使用了`mergeAutoRunActions`此处就不会触发`A`的更新了
//     dispatch({
//       type: 'app/setProps',
//       payload: {
//         number: 10,
//         name: 'li',
//       }
//     })
//   }, [])
// }

// const NextA = React.memo(observe(A), () => true)

// const App = () => {
//   const [state] = useRelinx('app')
//   const { name } = state

//   return (
//     <>
//       {name}
//       <NextA />
//       <B />
//     </>
//   )
// }
// ```

// 解决的办法：
// 1. observe接受第二个参数为`forceUpdate`；如果说为`true`；那么mergeAutoRunActions
//    要保留当前的`Computation`
// 2. 提供一个新的`React.memo` API；在状态管理层自己消化掉，不需要用户去感知次部分逻辑
// 3. React.memo中不要使用`useRelinx`来注入数据源(目前推荐)

// 在一次`dispatch`中会存在同时操作`parent`和`children`的情况，
// 这个时候只需要`parent`触发更新就好；
const mergeAutoRunActions = computations => {
  const len = computations.length
  const remaining = []

  for (let i = 0; i < len; i++) {
    const comp = computations[i]
    let {pathNumber} = comp
    let currentComp = comp

    for (let j = i + 1; j < len; j++) {
      const jComp = computations[j]
      const jPath = jComp.pathNumber

      if (pathNumber.startsWith(jPath)) {
        pathNumber = jPath
        currentComp = jComp
      } else if (jPath.startsWith(pathNumber)) {
        jComp.resolved = true
      }
    }

    if (!currentComp.resolved) {
      currentComp.resolved = true
      remaining.push(currentComp)
    }
  }

  return remaining
}

export default mergeAutoRunActions
