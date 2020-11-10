# observe

状态数据主要来自两个方面：
1. `useRelinx()`返回state，然后在组件层面通过state来进行数据的访问
2. 通过`props`来注入，可以认为是props property


在relinx中，observe的作用主要有两方面，
1. 对Component进行一次React.memo的加持
2. 增加一个data access context，此时间段收集的属性路径都是归属当前的component以达到粒度化的控制

## 什么时候使用observe


