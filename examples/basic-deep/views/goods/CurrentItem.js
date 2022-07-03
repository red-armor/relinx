import React from 'react'
import GoodsItem from "./GoodsItem";
import { useRelinx, observe } from 'relinx'

const CurrentItem = () => {
  const [state] = useRelinx('goods')
  const { currentItem } = state

  return (
    <>
      <span style={{ 'marginTop': '20px' }}>Current item</span>
      {!!currentItem && <GoodsItem data={currentItem} />}
    </>
  )
}

export default observe(CurrentItem)