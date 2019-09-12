import React, { useEffect, useState, useMemo } from 'react'

import createDeepProxy from './createDeepProxy'

const s2 = {
  a: {
    c: 1,
    d: 2,
  },
  b: {
    f: {
      g: 5,
    },
    q: 4,
  }
}

const { state: ps, useReactiveState } = createDeepProxy(s2)
const handleClick = () => {
  ps.a.d += 1
}

const handleClick2 = () => {
  ps.a.c += 1
}

const WithInitialState = () => {
  const state1 = useMemo(() => useReactiveState(), [])

  const [value, setValue] = useState(0)
  useEffect(() => {
    const { unsubscribe } = state1.subscribe(() => {
      setValue(Math.floor(Math.random() * 100) + 1  )
    })

    return unsubscribe
  }, [])

  const { a: { d }, b: { f: { g }}} = state1

  return (
    <div>
      {/* {state1.a.d} - {state1.b.f.g} */}
      {d} - {g}
      <button onClick={handleClick}>
        increment
      </button>
    </div>
  )
}

const WithInitialState2 = () => {
  const [value, setValue] = useState(0)
  const state2 = useMemo(() => useReactiveState(), [])

  useEffect(() => {
    const { unsubscribe } = state2.subscribe(() => {
      setValue(Math.floor(Math.random() * 100) + 1  )
    })

    return unsubscribe
  }, [])

  const { a: { c }, b: { f: { g }}} = state2

  return (
    <div>
      {/* {state2.a.c} - {state2.b.f.g} */}
      {c} - {g}
      <button onClick={handleClick2}>
        increment
      </button>
    </div>
  )
}

export default () => {
  return (
    <>
      <WithInitialState />
      <WithInitialState2 />
    </>
  )
}