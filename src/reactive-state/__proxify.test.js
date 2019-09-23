const test = {
  a:{b: {c: 3}},
  e:{f:4},
  g:{q:{m: 5}}
}

const ps = proxify(test, (paths, value) => {
  console.log('notified : ', paths, value)
})

console.log('ps : ', ps.a.b.c)
ps.a.b.c = 7
ps.a.b.c = 7

console.log('proxifiedTest : ', ps)