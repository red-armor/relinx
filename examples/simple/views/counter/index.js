import React, { useCallback } from 'react'
import { observe, useRelinx } from 'relinx'

const Counter = () => {
  const [state, dispatch] = useRelinx('counter')

  const increment = useCallback(() => {
    dispatch({ type: 'counter/increment' })
  }, [])

  const decrement = useCallback(() => {
    dispatch({ type: 'counter/decrement' })
  }, [])

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={increment}> + </button>
      <button onClick={decrement}> - </button>
    </div>
  )
}

export default observe(Counter)