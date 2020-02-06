const handler = {
  get: (target, property, receiver) => {
    const currentComputation = central.currentComputation
    const nextTarget = target
    let originalValue = Reflect.get(initialState, property, receiver)

    // 比如说触发当前更新的Component的property来自于上游（FlatList中的data属性）；
    // 按照正常的方式，如果这一层不做拦截的话，即使`Component` rerun，它依旧是拿不到
    // 最新的`value`；因为它使用到的`item`是上游传的，现在粒度化的控制，造成了上游
    // 是不进行没必要的render的
    if (currentComputation && currentComputation.autoRunUpdated && currentComputation !== comp) {
      const currentState = central.getCurrentState(namespace)
      originalValue = getPathValue(paths.concat(property), currentState)
    }

    // 比如将data作为props往下传递的时候，`reactive`对于子组件而言没有存在的意义；所以这里面
    // 返回一个`unProxy`对象
    if (property === 'getUnTrack') {
      if (Array.isArray(nextTarget)) {
        const len = nextTarget.length
        for (let i = 0; i < len; i++) {
          central.register({
            paths,
            comp: central.currentComputation || comp,
            property: i,
            namespace,
          })
        }
      }
      return () => initialState
    }
    const type = toString(originalValue)

    // TODO：存在一个问题，如果说是一个空对象`a = {}`，假如在代码层面直接使用a.b的话；
    // 现在register是不会将b绑定的，突然一个时间点`set(a, {b: 1})`相应的组件也不会发生变化；
    // 所以，这个需要思考是否可以通过`Reflect.get()来协助`
    // if (nextTarget.hasOwnProperty(property)
    //   || (!nextTarget.hasOwnProperty(property)
    //   && typeof originalValue === 'undefined'
    // )) {
    if (nextTarget.hasOwnProperty(property)) { // eslint-disable-line
      central.register({
        paths,
        comp: central.currentComputation || comp,
        property,
        namespace,
      })
    }

    if (shouldWrappedByProxy(originalValue)) {
      let nextValue
      const unobservable = originalValue
      if (type === '[object Object]') {
        nextValue = { ...unobservable }
      }

      if (type === '[object Array]') {
        nextValue = [...unobservable]
      }

      // 只要`useTracker`触发，就会执行`createHandler`操作，所以也就会有新的
      // Proxy对象创建
      return new Proxy(nextValue, createHandler({
        initialState: unobservable,
        comp,
        paths: paths.concat(property),
        namespace,
      }))
    }
    return originalValue
  }
}

const getLiteralValue = () => {

}

export function createTracker(target) {
  const { proxy, revoke } = Proxy.revocable(target, handler)
  return { proxy, revoke }
}