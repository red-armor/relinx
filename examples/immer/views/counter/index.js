import React, { useCallback } from 'react'
import { observe, useRelinx } from 'relinx'

const Counter = () => {
  const [state, dispatch] = useRelinx('counter')
  const { items, count } = state

  const increment = useCallback(() => {
    dispatch({ type: 'counter/increment' })
  }, [])

  const decrement = useCallback(() => {
    dispatch({ type: 'counter/decrement' })
  }, [])

  const incrementItemNumber = index => {
    dispatch({
      type: 'counter/incrementItemNumber',
      payload: index,
    })
  }
  const decrementItemNumber = index => {
    dispatch({
      type: 'counter/decrementItemNumber',
      payload: index,
    })
  }

  return (
    <div>
      <div>
        <span>{count}</span>
        <button onClick={increment}> + </button>
        <button onClick={decrement}> - </button>
      </div>

      {items.map((item, index) => (
        <div key={index}>
          <span>{item.number}</span>
          <button onClick={incrementItemNumber.bind(null, index)}> + </button>
          <button onClick={decrementItemNumber.bind(null, index)}> - </button>
        </div>
      ))}
    </div>
  )
}

export default observe(Counter)