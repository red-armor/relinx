---
title: State Updating
sidebar_position: 2
---

在默认情况下，`relinx`对于状态的更新是通过`dispatch`的方式触发；当`store`接受到`changedValues`以后，不会马上进行state的设置，会被放置到`nextTick`进行batch处理

```js
class TaskQueue {
  nextTick(fn: Function) {
    this._task.push(fn);

    if (!this._pending) {
      this._pending = true;
      this.flushAsync();
    }
  }

  flushAsync() {
    Promise.resolve().then(() => {
      this.flush();
    });
  }
}
```

## Sync Updating

但是还有一种场景，比如当渲染某一个组件时，数据已经有了；其实更适当的时机是，直接就将值设置到model中，确保能够直接使用；可以通过`store.flush()`的方式实现；

```js
const Goods = observe(() => {
  const initialRef = useRef(false)

  if (initialRef.current) {
    initialRef.current = false;
    if (initialData.length) {
      // 如果希望马上就生效，这个时候需要调用flush method
      dispatch({
        type: `${modelKey}/setProps`,
        payload: { data: initialData },
      });
      store.flush(); // trigger state update immediately
    } else {
      dispatch({
        type: `${modelKey}/fetchGoods`,
      });
    }
  }

  const [state] = useRelinx()
})
```

:::caution
当通过**store.flush()**强制**state**进行马上更新以后，这个时候要注意将**useRelinx**放置到它的后面，否则拿到的state依旧是老值
:::