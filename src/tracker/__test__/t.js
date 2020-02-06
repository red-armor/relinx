
test("empty stub test", () => {
	expect(true).toBe(true)
})

// import React, {
//   useRef, useEffect, useState, useMemo,
// } from 'react'
// import useTracker from './useTracker'
// import central from './central'

// central.setBase({
//   a: { c: { f: 4 } },
//   b: [2, 3],
// })

// const A = () => {
//   const [i, setState] = useState(0)
//   const state = useTracker(() => {
//     setState(i + 1)
//     console.log('trigger update A')
//   })

//   const counter = useRef(0)
//   useEffect(() => {
//     counter.current += 1
//   })

//   const a = state.a

//   return (
//     <div>
// a:
//       {counter.current}
//     </div>
//   )
// }

// const B = () => {
//   const [i, setState] = useState(0)
//   const state = useTracker(() => {
//     setState(i + 1)
//     console.log('trigger update B')
//   })

//   const counter = useRef(0)
//   useEffect(() => {
//     counter.current += 1
//   })

//   const b = state.b

//   return (
//     <div>
// b:
//       {counter.current}
//     </div>
//   )
// }

// const C = () => {
//   const [i, setState] = useState(0)
//   const state = useTracker(() => {
//     setState(i + 1)
//     console.log('trigger update C')
//   })

//   const counter = useRef(0)
//   useEffect(() => {
//     counter.current += 1
//   })

//   const c = state.a.c
//   return (
//     <div>
// c:
//       {counter.current}
//     </div>
//   )
// }

// const D = () => {
//   const [i, setState] = useState(0)
//   const state = useTracker(() => {
//     setState(i + 1)
//     console.log('trigger update D')
//   })

//   const counter = useRef(0)
//   useEffect(() => {
//     counter.current += 1
//   })

//   const d = state.a.c.f
//   return (
//     <div>
// d:
//       {counter.current}
//     </div>
//   )
// }

// export default () => {
//   const [i, setI] = useState(0)

//   const state = useTracker(() => {
//     setI(i + 1)
//     console.log('trigger update')
//   })

//   const a = state.a.c.f
//   const b = state.b

//   // console.log('state : ', state)

//   // console.log('a : ', a)
//   // console.log('b : ', b)

//   console.log('central : ', central)

//   const content = useMemo(() => (
//     <>
//       <A />
//       <B />
//       <C />
//       <D />
//     </>
//   ), [])

//   return content
// }

// // setTimeout(() => {
// setInterval(() => {
//   console.log('set time -----')
//   central.reconcileWithPaths(['a', 'c', 'f'], Date.now())
//   // central.reconcileWithPaths(['a', 'c'], Date.now())
//   central.reconcileWithPaths(['b'], Date.now())
//   console.log('central : ', central)
// }, 1000)
