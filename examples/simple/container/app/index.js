import React from 'react'
import CounterWithoutObserveItem from '../../views/counter-without-observe-item'
import CounterWithObserveItem from '../../views/counter-with-observe-item'

export default () => {
  console.log('trigger app --')
  return (
    <div>
      <CounterWithoutObserveItem />
      {/* <CounterWithObserveItem /> */}
    </div>
  )
}