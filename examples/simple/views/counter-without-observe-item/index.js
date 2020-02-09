import React, { useCallback } from 'react'
import { observe, useRelinx, useDispatch } from 'relinx'

const Title = () => {
  console.log('trigger title')
  return (
    <div>Counter without observe item</div>
  )
}

const Item = ({ item, index }) => {
  console.log('trigger item ', index)
  const [dispatch] = useDispatch()
  // const [, dispatch] = useRelinx('counterWithoutObserveItem')
  const incrementItemNumber = () => {
    dispatch({
      type: 'counterWithoutObserveItem/incrementItemNumber',
      payload: index,
    })
  }
  const decrementItemNumber = () => {
    dispatch({
      type: 'counterWithoutObserveItem/decrementItemNumber',
      payload: index,
    })
  }

  return (
    <div key={index}>
      <span>{item.number}</span>
      <button onClick={incrementItemNumber}> + </button>
      <button onClick={decrementItemNumber}> - </button>
    </div>
  )
}

const Counter = () => {
  const [state, dispatch] = useRelinx('counterWithoutObserveItem')
  const { items, count } = state

  console.log('trigger counterWithoutObserveItem --')

  const increment = useCallback(() => {
    dispatch({ type: 'counterWithoutObserveItem/increment' })
  }, [])

  const decrement = useCallback(() => {
    dispatch({ type: 'counterWithoutObserveItem/decrement' })
  }, [])

  return (
    <div style={{ marginTop: '30px' }}>
      <div>
        <span>{count}</span>
        <button onClick={increment}> + </button>
        <button onClick={decrement}> - </button>
      </div>
      <Title />

      {items.map((item, index) => <Item key={index} index={index} item={item} dispatch={dispatch} />)}
    </div>
  )
}

export default observe(Counter)