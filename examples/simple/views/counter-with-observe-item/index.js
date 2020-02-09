import React, { useCallback } from 'react'
import { observe, useRelinx } from 'relinx'

const Title = () => {
  console.log('trigger title')
  return (
    <div>Counter with observe item</div>
  )
}

const Item = ({ item, index }) => {
  console.log('trigger item ', index)
  const [, dispatch] = useRelinx('counterWithObserveItem')
  const incrementItemNumber = () => {
    dispatch({
      type: 'counterWithObserveItem/incrementItemNumber',
      payload: index,
    })
  }
  const decrementItemNumber = () => {
    dispatch({
      type: 'counterWithObserveItem/decrementItemNumber',
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

const ObservedItem = observe(Item)

const Counter = () => {
  const [state, dispatch] = useRelinx('counterWithObserveItem')
  const { items, count } = state

  console.log('trigger counterWithObserveItem --')

  const increment = useCallback(() => {
    dispatch({ type: 'counterWithObserveItem/increment' })
  }, [])

  const decrement = useCallback(() => {
    dispatch({ type: 'counterWithObserveItem/decrement' })
  }, [])

  console.log('console ', items[0])

  return (
    <div style={{ marginTop: '30px' }}>
      <div>
        <span>{count}</span>
        <button onClick={increment}> + </button>
        <button onClick={decrement}> - </button>
      </div>
      <Title />
      {items.map((item, index) => <ObservedItem key={index} index={index} item={item} />)}
    </div>
  )
}

export default observe(Counter)