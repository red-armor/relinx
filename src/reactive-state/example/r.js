// 对于一个state不存在被删除的情况, 所以目前不考虑`delete` trap
// 如何知道这个是`p.a.b`中的最后一个field？因为这个时候我只想响应b的变化，`p.a`等于多少我不关心
// 单一路径的copy，比如它只有p.a.b, p.a.c；至于说p.a.d我就不关心了
// 支持动态的增加一个path，比如说在一定条件下会调用函数() => console.log(p.a.d)这个时候d就要加入到`subscriptions`
// 如何区分p.a和p.a.b第一个的话，它会拿p.a的值，而第二个的话，它会去拿`p.a.b`的值；这个时候你不能将它合并
const state = {
  location: 'beijing',
  name: {
    familyName: 'Li',
    firstName: 'Lei',
  }
}

const first = () => {
  const state = useReactiveState()
  state.subscribe(() => {
    console.log('change : ')
  })

  console.log('state : ', state.name.firstName)
}

const location = () => {
  const state = useReactiveState()
  state.subscribe(() => {
    console.log('change : ')
  })

  console.log('state : ', state.location)
}